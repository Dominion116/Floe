module floe::escrow;

use sui::balance::{Self, Balance};
use sui::bcs;
use sui::clock::Clock;
use sui::coin::{Self, Coin};
use sui::ed25519;
use sui::event;

/// Error codes
const EInvalidSignature: u64 = 0;
const EEscrowExpired: u64 = 1;
const EUnauthorized: u64 = 3;
const EInsufficientBalance: u64 = 4;
const EInvalidPublicKey: u64 = 5;
const EInvalidDuration: u64 = 6;

const ED25519_PUBLIC_KEY_LENGTH: u64 = 32;
/// 365 days. Keeps `now + duration_ms` far from overflow.
const MAX_DURATION_MS: u64 = 31_536_000_000;

/// Lofi Foundation treasury, as published in the code of donate.lofifoundation.com.
const CLEAN_WATER_TREASURY: address =
    @0xb1a99b2135e594ed62506352a79362a146dda11398cacb187cb42533b66ce69c;

/// Shared object holding the deposited funds until they are claimed or reclaimed.
public struct PaymentEscrow<phantom T> has key {
    id: UID,
    balance: Balance<T>,
    sender: address,
    ephemeral_pubkey: vector<u8>, // Ed25519 public key (32 bytes)
    expires_at_ms: u64,
    water_donation: Balance<T>,
    theme_id: u8,
}

/// Events
public struct EscrowCreated has copy, drop {
    escrow_id: ID,
    sender: address,
    amount: u64,
    water_donation: u64,
    theme_id: u8,
}

public struct EscrowClaimed has copy, drop {
    escrow_id: ID,
    recipient: address,
    amount: u64,
    water_donation: u64,
}

public struct EscrowReclaimed has copy, drop {
    escrow_id: ID,
    sender: address,
    amount: u64,
}

/// Locks `coin` so that only the holder of the link's private key can direct it.
/// `water_cut` is set aside for the treasury and is included in `coin`.
public fun create_escrow<T>(
    mut coin: Coin<T>,
    ephem_pubkey: vector<u8>,
    duration_ms: u64,
    water_cut: u64,
    theme_id: u8,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    assert!(coin.value() > water_cut, EInsufficientBalance);
    assert!(ephem_pubkey.length() == ED25519_PUBLIC_KEY_LENGTH, EInvalidPublicKey);
    assert!(duration_ms > 0 && duration_ms <= MAX_DURATION_MS, EInvalidDuration);

    let water_donation = coin.split(water_cut, ctx).into_balance();
    let balance = coin.into_balance();
    let amount = balance.value();
    let sender = ctx.sender();

    let escrow = PaymentEscrow<T> {
        id: object::new(ctx),
        balance,
        sender,
        ephemeral_pubkey: ephem_pubkey,
        expires_at_ms: clock.timestamp_ms() + duration_ms,
        water_donation,
        theme_id,
    };

    event::emit(EscrowCreated {
        escrow_id: object::id(&escrow),
        sender,
        amount,
        water_donation: water_cut,
        theme_id,
    });

    transfer::share_object(escrow);
}

/// Pays `recipient`. Anyone may submit this, because `signature` is made with the
/// link's private key over this escrow's ID and the recipient, so a copied
/// signature can't be redirected to another address or replayed on another escrow.
public fun claim_escrow<T>(
    escrow: PaymentEscrow<T>,
    signature: vector<u8>,
    recipient: address,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    assert!(clock.timestamp_ms() <= escrow.expires_at_ms, EEscrowExpired);

    let msg = claim_message(object::id(&escrow), recipient);
    assert!(
        ed25519::ed25519_verify(&signature, &escrow.ephemeral_pubkey, &msg),
        EInvalidSignature,
    );

    pay_out(escrow, recipient, ctx);
}

/// Returns everything, including the unspent donation, to the sender. Allowed at
/// any time while the escrow is unclaimed, before or after it expires.
public fun reclaim_escrow<T>(escrow: PaymentEscrow<T>, ctx: &mut TxContext) {
    let sender = ctx.sender();
    assert!(sender == escrow.sender, EUnauthorized);

    let PaymentEscrow { id, mut balance, water_donation, .. } = escrow;
    let escrow_id = id.to_inner();
    id.delete();

    balance.join(water_donation);
    let amount = balance.value();
    transfer::public_transfer(coin::from_balance(balance, ctx), sender);

    event::emit(EscrowReclaimed { escrow_id, sender, amount });
}

/// The bytes the link's private key signs: escrow ID followed by recipient.
fun claim_message(escrow_id: ID, recipient: address): vector<u8> {
    let mut msg = bcs::to_bytes(&escrow_id);
    msg.append(bcs::to_bytes(&recipient));
    msg
}

fun pay_out<T>(escrow: PaymentEscrow<T>, recipient: address, ctx: &mut TxContext) {
    let PaymentEscrow { id, balance, water_donation, .. } = escrow;
    let escrow_id = id.to_inner();
    id.delete();

    let amount = balance.value();
    let water_amount = water_donation.value();

    transfer::public_transfer(coin::from_balance(balance, ctx), recipient);

    if (water_amount > 0) {
        transfer::public_transfer(coin::from_balance(water_donation, ctx), CLEAN_WATER_TREASURY);
    } else {
        balance::destroy_zero(water_donation);
    };

    event::emit(EscrowClaimed { escrow_id, recipient, amount, water_donation: water_amount });
}

#[test_only]
public fun treasury_for_testing(): address { CLEAN_WATER_TREASURY }

#[test_only]
public fun pay_out_for_testing<T>(
    escrow: PaymentEscrow<T>,
    recipient: address,
    ctx: &mut TxContext,
) {
    pay_out(escrow, recipient, ctx)
}

#[test_only]
public fun claim_message_for_testing(escrow_id: ID, recipient: address): vector<u8> {
    claim_message(escrow_id, recipient)
}
