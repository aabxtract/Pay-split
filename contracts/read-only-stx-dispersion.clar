;; Payment storage contract
;; Stores recipient names and amounts for payment tracking
;; No token sending functionality - storage only

(define-constant ERR_NOT_FOUND (err u100))
(define-constant ERR_INVALID_AMOUNT (err u101))
(define-constant MAX_NAME_LENGTH (u100))

;; Data maps for storing payment information
(define-data-var recipients (map (string-utf8 MAX_NAME_LENGTH) uint) {})

;; Add or update a recipient with their amount
(define-public (add-recipient (name (string-utf8 MAX_NAME_LENGTH)) (amount uint))
  (let ((current-amount (default-to u0 (map-get? (var-get recipients) name))))
    (if (is-eq amount u0)
      ERR_INVALID_AMOUNT
      (ok (var-set recipients (map-set (var-get recipients) name amount)))
    )
  )
)

;; Remove a recipient from storage
(define-public (remove-recipient (name (string-utf8 MAX_NAME_LENGTH)))
  (let ((current-amount (map-get? (var-get recipients) name)))
    (match current-amount
      amount (ok (var-set recipients (map-delete (var-get recipients) name)))
      ERR_NOT_FOUND
    )
  )
)

;; Get amount for a specific recipient
(define-read-only (get-recipient-amount (name (string-utf8 MAX_NAME_LENGTH)))
  (let ((amount (map-get? (var-get recipients) name)))
    (match amount
      value (ok value)
      ERR_NOT_FOUND
    )
  )
)

;; Get all recipients and their amounts
(define-read-only (get-all-recipients)
  (ok (var-get recipients))
)

;; Get total amount stored
(define-read-only (get-total-amount)
  (let ((recipients-map (var-get recipients)))
    (ok (fold 
      (lambda (entry total)
        (+ total (get value entry))
      )
      (map-to-list recipients-map)
      u0
    ))
  )
)
