;; transaction-storage
;; Contract to store transaction records

;; Constants
(define-constant err-not-authorized (err u100))

;; Data Maps
(define-map transactions
    uint
    {
        sender: principal,
        recipient: principal,
        amount: uint,
        memo: (buff 34),
        block-height: uint
    }
)

;; Data Variables
(define-data-var last-tx-id uint u0)

;; Public Functions
(define-public (store-transaction (recipient principal) (amount uint) (memo (buff 34)))
    (let
        (
            (tx-id (+ (var-get last-tx-id) u1))
            (sender tx-sender)
        )
        (map-insert transactions tx-id {
            sender: sender,
            recipient: recipient,
            amount: amount,
            memo: memo,
            block-height: block-height
        })
        (var-set last-tx-id tx-id)
        (ok tx-id)
    )
)

;; Read-Only Functions
(define-read-only (get-transaction (tx-id uint))
    (map-get? transactions tx-id)
)

(define-read-only (get-last-tx-id)
    (var-get last-tx-id)
)
