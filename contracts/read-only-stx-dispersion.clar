;; Read-only STX dispersion preview contract.
;; It never calls stx-transfer? and cannot move funds.

(define-constant ERR_INVALID_INPUT (err u100))
(define-constant MAX_RECIPIENTS u200)

(define-private (sum-recipient (recipient {wallet: principal, amount: uint}) (running uint))
  (+ running (get amount recipient))
)

(define-private (count-invalid-recipient (recipient {wallet: principal, amount: uint}) (running uint))
  (if (is-eq (get amount recipient) u0)
    (+ running u1)
    running
  )
)

(define-read-only (preview-single
    (sender principal)
    (recipient principal)
    (amount uint)
    (memo (string-utf8 64))
  )
  (if (or (is-eq amount u0) (is-eq sender recipient))
    ERR_INVALID_INPUT
    (ok {
      sender: sender,
      recipient-count: u1,
      total-microstx: amount,
      memo: memo,
      executable: false
    })
  )
)

(define-read-only (preview-many
    (sender principal)
    (recipients (list 200 {wallet: principal, amount: uint}))
    (memo (string-utf8 64))
  )
  (let (
      (recipient-count (len recipients))
      (invalid-count (fold count-invalid-recipient recipients u0))
      (total (fold sum-recipient recipients u0))
    )
    (if (or
        (is-eq recipient-count u0)
        (> recipient-count MAX_RECIPIENTS)
        (> invalid-count u0)
      )
      ERR_INVALID_INPUT
      (ok {
        sender: sender,
        recipient-count: recipient-count,
        total-microstx: total,
        memo: memo,
        executable: false
      })
    )
  )
)
