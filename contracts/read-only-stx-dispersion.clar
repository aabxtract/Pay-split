;; Payment storage contract
;; Stores recipient names and amounts for payment tracking

(define-constant ERR_NOT_FOUND (err u100))
(define-constant ERR_INVALID_AMOUNT (err u101))

(define-map recipients (string-utf8 100) uint)
(define-data-var total-amount uint u0)

(define-public (add-recipient (name (string-utf8 100)) (amount uint))
  (if (is-eq amount u0)
    ERR_INVALID_AMOUNT
    (let ((prev (default-to u0 (map-get? recipients name))))
      (map-set recipients name amount)
      (var-set total-amount (+ (- (var-get total-amount) prev) amount))
      (ok true)
    )
  )
)

(define-public (remove-recipient (name (string-utf8 100)))
  (match (map-get? recipients name)
    amount
      (begin
        (map-delete recipients name)
        (var-set total-amount (- (var-get total-amount) amount))
        (ok true)
      )
    ERR_NOT_FOUND
  )
)

(define-read-only (get-recipient-amount (name (string-utf8 100)))
  (match (map-get? recipients name)
    value (ok value)
    ERR_NOT_FOUND
  )
)

(define-read-only (get-total-amount)
  (ok (var-get total-amount))
)
