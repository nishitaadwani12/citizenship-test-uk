import { StyleProp, ViewStyle } from 'react-native';
import { styles } from './theme';

/** Pressable `style` callbacks, centralised so their pressed/!pressed branches
 *  are covered by one focused test instead of inline in every screen. */
type P = { pressed: boolean };
type S = StyleProp<ViewStyle>;

export const pressBtn = ({ pressed }: P) => [styles.button, pressed && styles.buttonPressed];

/** A variant button (e.g. the white Google button): dims while busy or pressed. */
export const pressVariant =
  (base: S, busy: boolean) =>
  ({ pressed }: P): S =>
    [base, busy && { opacity: 0.6 }, pressed && !busy && { opacity: 0.85 }];

export const pressCard = ({ pressed }: P) => [styles.card, pressed && styles.cardPressed];

export const pressFade = ({ pressed }: P): S => ({
  cursor: 'pointer',
  opacity: pressed ? 0.6 : 1,
});

export const pressUpsell = ({ pressed }: P) => [styles.upsell, pressed && { opacity: 0.7 }];

export const pressDanger = ({ pressed }: P) => [
  styles.button,
  styles.dangerButton,
  pressed && { opacity: 0.85 },
];

/** Primary button that is disabled while `busy`. */
export const pressBusyBtn =
  (busy: boolean) =>
  ({ pressed }: P) =>
    [styles.button, busy && styles.buttonDisabled, pressed && !busy && styles.buttonPressed];

/** Advance button that is disabled unless `canAdvance`. */
export const pressAdvanceBtn =
  (canAdvance: boolean) =>
  ({ pressed }: P) =>
    [
      styles.button,
      !canAdvance && styles.buttonDisabled,
      pressed && canAdvance && styles.buttonPressed,
    ];

/** Quiz option: adds a pressed tint unless the answer is already checked. */
export const pressOption =
  (base: S[], checked: boolean) =>
  ({ pressed }: P): S =>
    [...base, pressed && !checked && styles.optionPressed];
