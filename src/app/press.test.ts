import {
  pressAdvanceBtn,
  pressBtn,
  pressBusyBtn,
  pressCard,
  pressDanger,
  pressFade,
  pressOption,
  pressUpsell,
  pressVariant,
} from './press';

describe('press style callbacks', () => {
  it('covers pressed and unpressed for simple styles', () => {
    expect(pressBtn({ pressed: true })).toBeTruthy();
    expect(pressBtn({ pressed: false })).toBeTruthy();
    expect(pressCard({ pressed: true })).toBeTruthy();
    expect(pressCard({ pressed: false })).toBeTruthy();
    expect(pressUpsell({ pressed: true })).toBeTruthy();
    expect(pressUpsell({ pressed: false })).toBeTruthy();
    expect(pressDanger({ pressed: true })).toBeTruthy();
    expect(pressDanger({ pressed: false })).toBeTruthy();
  });

  it('fades only when pressed', () => {
    expect(pressFade({ pressed: true })).toEqual({ cursor: 'pointer', opacity: 0.6 });
    expect(pressFade({ pressed: false })).toEqual({ cursor: 'pointer', opacity: 1 });
  });

  it('covers busy and pressed permutations for the busy button', () => {
    for (const busy of [true, false]) {
      for (const pressed of [true, false]) {
        expect(pressBusyBtn(busy)({ pressed })).toBeTruthy();
      }
    }
  });

  it('covers canAdvance and pressed permutations for the advance button', () => {
    for (const canAdvance of [true, false]) {
      for (const pressed of [true, false]) {
        expect(pressAdvanceBtn(canAdvance)({ pressed })).toBeTruthy();
      }
    }
  });

  it('covers busy and pressed permutations for variant buttons', () => {
    for (const busy of [true, false]) {
      for (const pressed of [true, false]) {
        expect(pressVariant({}, busy)({ pressed })).toBeTruthy();
      }
    }
  });

  it('covers checked and pressed permutations for options', () => {
    for (const checked of [true, false]) {
      for (const pressed of [true, false]) {
        expect(pressOption([{}], checked)({ pressed })).toBeTruthy();
      }
    }
  });
});
