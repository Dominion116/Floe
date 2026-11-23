#[test_only]
module floe::escrow_tests;

use floe::escrow::{Self, PaymentEscrow};
use sui::clock::{Self, Clock};
use sui::coin::{Self, Coin};
use sui::sui::SUI;
use sui::test_scenario::{Self as ts, Scenario};

const SENDER: address = @0xA;
const RECIPIENT: address = @0xB;
const STRANGER: address = @0xC;

const PRINCIPAL: u64 = 1_000;
const WATER: u64 = 10;
const DURATION_MS: u64 = 1_000;

fun pubkey(): vector<u8> {
    x"0000000000000000000000000000000000000000000000000000000000000001"
}

fun setup(water: u64): (Scenario, Clock) {
    let mut scenario = ts::begin(SENDER);
    let clock = clock::create_for_testing(scenario.ctx());
    let coin = coin::mint_for_testing<SUI>(PRINCIPAL + water, scenario.ctx());
    escrow::create_escrow(coin, pubkey(), DURATION_MS, water, 0, &clock, scenario.ctx());
    (scenario, clock)
}

fun assert_received(scenario: &mut Scenario, who: address, amount: u64) {
    scenario.next_tx(who);
    let coin = scenario.take_from_address<Coin<SUI>>(who);
    assert!(coin.value() == amount);
    coin::burn_for_testing(coin);
}

#[test]
fun sender_reclaims_before_expiry_with_donation() {
    let (mut scenario, clock) = setup(WATER);
    scenario.next_tx(SENDER);
    let escrow = scenario.take_shared<PaymentEscrow<SUI>>();
    escrow::reclaim_escrow(escrow, scenario.ctx());
    assert_received(&mut scenario, SENDER, PRINCIPAL + WATER);
    clock.destroy_for_testing();
    scenario.end();
}

#[test]
fun sender_reclaims_after_expiry() {
    let (mut scenario, mut clock) = setup(0);
    clock.set_for_testing(DURATION_MS + 1);
    scenario.next_tx(SENDER);
    let escrow = scenario.take_shared<PaymentEscrow<SUI>>();
    escrow::reclaim_escrow(escrow, scenario.ctx());
    assert_received(&mut scenario, SENDER, PRINCIPAL);
    clock.destroy_for_testing();
    scenario.end();
}

#[test, expected_failure(abort_code = escrow::EUnauthorized)]
fun stranger_cannot_reclaim() {
    let (mut scenario, _clock) = setup(0);
    scenario.next_tx(STRANGER);
    let escrow = scenario.take_shared<PaymentEscrow<SUI>>();
    escrow::reclaim_escrow(escrow, scenario.ctx());
    abort 99
}

#[test]
fun payout_splits_principal_and_donation() {
    let (mut scenario, clock) = setup(WATER);
    scenario.next_tx(STRANGER);
    let escrow = scenario.take_shared<PaymentEscrow<SUI>>();
    escrow::pay_out_for_testing(escrow, RECIPIENT, scenario.ctx());
    assert_received(&mut scenario, RECIPIENT, PRINCIPAL);
    assert_received(&mut scenario, escrow::treasury_for_testing(), WATER);
    clock.destroy_for_testing();
    scenario.end();
}

#[test]
fun payout_without_donation() {
    let (mut scenario, clock) = setup(0);
    scenario.next_tx(STRANGER);
    let escrow = scenario.take_shared<PaymentEscrow<SUI>>();
    escrow::pay_out_for_testing(escrow, RECIPIENT, scenario.ctx());
    assert_received(&mut scenario, RECIPIENT, PRINCIPAL);
    clock.destroy_for_testing();
    scenario.end();
}

#[test, expected_failure(abort_code = escrow::EInvalidSignature)]
fun claim_rejects_bad_signature() {
    let (mut scenario, clock) = setup(0);
    scenario.next_tx(RECIPIENT);
    let escrow = scenario.take_shared<PaymentEscrow<SUI>>();
    escrow::claim_escrow(escrow, vector[], RECIPIENT, &clock, scenario.ctx());
    abort 99
}

#[test, expected_failure(abort_code = escrow::EEscrowExpired)]
fun claim_rejects_expired() {
    let (mut scenario, mut clock) = setup(0);
    clock.set_for_testing(DURATION_MS + 1);
    scenario.next_tx(RECIPIENT);
    let escrow = scenario.take_shared<PaymentEscrow<SUI>>();
    escrow::claim_escrow(escrow, vector[], RECIPIENT, &clock, scenario.ctx());
    abort 99
}

/// The web app builds this message too. Both sides must agree byte for byte.
#[test]
fun claim_message_is_id_then_recipient() {
    let id = object::id_from_address(@0x1);
    let msg = escrow::claim_message_for_testing(id, @0x2);
    let mut expected = sui::address::to_bytes(@0x1);
    expected.append(sui::address::to_bytes(@0x2));
    assert!(msg == expected);
}

#[test, expected_failure(abort_code = escrow::EInvalidPublicKey)]
fun create_rejects_short_public_key() {
    let mut scenario = ts::begin(SENDER);
    let clock = clock::create_for_testing(scenario.ctx());
    let coin = coin::mint_for_testing<SUI>(PRINCIPAL, scenario.ctx());
    escrow::create_escrow(coin, x"01", DURATION_MS, 0, 0, &clock, scenario.ctx());
    abort 99
}

#[test, expected_failure(abort_code = escrow::EInsufficientBalance)]
fun create_rejects_donation_of_everything() {
    let mut scenario = ts::begin(SENDER);
    let clock = clock::create_for_testing(scenario.ctx());
    let coin = coin::mint_for_testing<SUI>(WATER, scenario.ctx());
    escrow::create_escrow(coin, pubkey(), DURATION_MS, WATER, 0, &clock, scenario.ctx());
    abort 99
}

#[test, expected_failure(abort_code = escrow::EInvalidDuration)]
fun create_rejects_zero_duration() {
    let mut scenario = ts::begin(SENDER);
    let clock = clock::create_for_testing(scenario.ctx());
    let coin = coin::mint_for_testing<SUI>(PRINCIPAL, scenario.ctx());
    escrow::create_escrow(coin, pubkey(), 0, 0, 0, &clock, scenario.ctx());
    abort 99
}
