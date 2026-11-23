module floe::escrow {
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::clock::{Self, Clock};
    use sui::event;
    use sui::ed25519;
    use sui::bcs;

    /// Error codes
    const EInvalidSignature: u64 = 0;
    const EEscrowExpired: u64 = 1;
    const EEscrowNotExpired: u64 = 2;
    const EUnauthorized: u64 = 3;
    const EInsufficientBalance: u64 = 4;

    /// Verified Lofi Foundation Clean Water Treasury Address
    const CLEAN_WATER_TREASURY: address = @0x10f1c1ea00000000000000000000000000000000000000000000000000000000;

    /// The Shared Escrow Object holding the deposited funds
    public struct PaymentEscrow<phantom T> has key, store {
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

    /// Entry 1: Create Escrow
    public entry fun create_escrow<T>(
        mut coin: Coin<T>,
        ephem_pubkey: vector<u8>,
        duration_ms: u64,
        water_cut: u64,
        theme_id: u8,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let total_val = coin::value(&coin);
        assert!(total_val > water_cut, EInsufficientBalance);

        let sender = tx_context::sender(ctx);
        let now = clock::timestamp_ms(clock);
        let expires_at_ms = now + duration_ms;

        let mut water_donation_balance = balance::zero<T>();
        if (water_cut > 0) {
            let water_coin = coin::split(&mut coin, water_cut, ctx);
            balance::join(&mut water_donation_balance, coin::into_balance(water_coin));
        };

        let principal_balance = coin::into_balance(coin);
        let principal_amount = balance::value(&principal_balance);

        let escrow = PaymentEscrow<T> {
            id: object::new(ctx),
            balance: principal_balance,
            sender,
            ephemeral_pubkey: ephem_pubkey,
            expires_at_ms,
            water_donation: water_donation_balance,
            theme_id,
        };

        let escrow_id = object::id(&escrow);
        event::emit(EscrowCreated {
            escrow_id,
            sender,
            amount: principal_amount,
            water_donation: water_cut,
            theme_id,
        });

        transfer::share_object(escrow);
    }

    /// Entry 2: Claim Escrow
    /// Verifies ephemeral keypair signature over recipient's address bytes
    public entry fun claim_escrow<T>(
        escrow: PaymentEscrow<T>,
        signature: vector<u8>,
        recipient: address,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let now = clock::timestamp_ms(clock);
        assert!(now <= escrow.expires_at_ms, EEscrowExpired);

        // Verification: recipient address is signed by ephemeral secret key
        let msg = bcs::to_bytes(&recipient);
        let is_valid = ed25519::ed25519_verify(&signature, &escrow.ephemeral_pubkey, &msg);
        assert!(is_valid, EInvalidSignature);

        let PaymentEscrow {
            id,
            balance,
            sender: _,
            ephemeral_pubkey: _,
            expires_at_ms: _,
            water_donation,
            theme_id: _,
        } = escrow;

        let escrow_id = object::uid_to_inner(&id);
        object::delete(id);

        let claim_amount = balance::value(&balance);
        let water_amount = balance::value(&water_donation);

        // Transfer funds to recipient
        let payout_coin = coin::from_balance(balance, ctx);
        transfer::public_transfer(payout_coin, recipient);

        // Route clean water donation if any
        if (water_amount > 0) {
            let water_coin = coin::from_balance(water_donation, ctx);
            transfer::public_transfer(water_coin, CLEAN_WATER_TREASURY);
        } else {
            balance::destroy_zero(water_donation);
        };

        event::emit(EscrowClaimed {
            escrow_id,
            recipient,
            amount: claim_amount,
            water_donation: water_amount,
        });
    }

    /// Entry 3: Reclaim Escrow (Sender clawback after expiry)
    public entry fun reclaim_escrow<T>(
        escrow: PaymentEscrow<T>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(sender == escrow.sender, EUnauthorized);

        let now = clock::timestamp_ms(clock);
        assert!(now >= escrow.expires_at_ms, EEscrowNotExpired);

        let PaymentEscrow {
            id,
            mut balance,
            sender: _,
            ephemeral_pubkey: _,
            expires_at_ms: _,
            water_donation,
            theme_id: _,
        } = escrow;

        let escrow_id = object::uid_to_inner(&id);
        object::delete(id);

        balance::join(&mut balance, water_donation);
        let refund_amount = balance::value(&balance);

        let refund_coin = coin::from_balance(balance, ctx);
        transfer::public_transfer(refund_coin, sender);

        event::emit(EscrowReclaimed {
            escrow_id,
            sender,
            amount: refund_amount,
        });
    }
}
