;; binary.wat - binary manipulation utilities
;; Copyright (C) 2021 MineNode
;;
;; This program is free software: you can redistribute it and/or modify
;; it under the terms of the GNU Affero General Public License as published
;; by the Free Software Foundation, either version 3 of the License, or
;; (at your option) any later version.
;;
;; This program is distributed in the hope that it will be useful,
;; but WITHOUT ANY WARRANTY; without even the implied warranty of
;; MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
;; GNU Affero General Public License for more details.
;;
;; You should have received a copy of the GNU Affero General Public License
;; along with this program.  If not, see <https://www.gnu.org/licenses/>.

(module
  ;; UnSigned Shift Right (USSR) - equivalent to the >>> operator in Java, for bigints
  ;; a >>> b -> ussr(a, b)
  (export "ussr" (func $ussr))
  (func $ussr (param $0 i64) (param $1 i64) (result i64)
    (i64.shr_u
      (get_local $0)
      (get_local $1)
    )
  )
)
