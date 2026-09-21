import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { Question } from '../core/types';
import { QuizRunner } from './QuizRunner';

const single: Question[] = [
  { id: 'a', prompt: 'A?', options: ['right', 'wrong'], correctIndices: [0], category: 'c' },
];

const multi: Question[] = [
  {
    id: 'm',
    prompt: 'M?',
    options: ['x', 'y', 'z'],
    correctIndices: [0, 1],
    category: 'c',
  },
];

const two: Question[] = [
  { id: 'a', prompt: 'A?', options: ['right', 'wrong'], correctIndices: [0], category: 'c' },
  { id: 'b', prompt: 'B?', options: ['no', 'yes'], correctIndices: [1], category: 'c' },
];

describe('QuizRunner', () => {
  it('renders an empty state with no questions', () => {
    render(<QuizRunner questions={[]} mode="practice" onFinish={jest.fn()} />);
    expect(screen.getByTestId('quiz-empty')).toBeTruthy();
  });

  it('requires an answer before advancing', () => {
    render(<QuizRunner questions={single} mode="practice" onFinish={jest.fn()} />);
    expect(screen.getByTestId('advance-button').props.accessibilityState.disabled).toBe(true);
  });

  it('checks a wrong answer then finishes with the score', () => {
    const onFinish = jest.fn();
    render(<QuizRunner questions={single} mode="practice" onFinish={onFinish} />);
    fireEvent.press(screen.getByTestId('option-1')); // wrong
    fireEvent.press(screen.getByTestId('check-button'));
    // After checking, the check button is gone and advancing is allowed.
    expect(screen.queryByTestId('check-button')).toBeNull();
    fireEvent.press(screen.getByTestId('advance-button'));
    expect(onFinish).toHaveBeenCalledWith(
      expect.objectContaining({ correct: 0, total: 1, passed: false }),
    );
  });

  it('locks options once the answer is checked', () => {
    const onFinish = jest.fn();
    render(<QuizRunner questions={single} mode="practice" onFinish={onFinish} />);
    fireEvent.press(screen.getByTestId('option-0')); // correct
    fireEvent.press(screen.getByTestId('check-button'));
    // Tapping another option after checking is ignored; the answer stays correct.
    fireEvent.press(screen.getByTestId('option-1'));
    fireEvent.press(screen.getByTestId('advance-button'));
    expect(onFinish).toHaveBeenCalledWith(
      expect.objectContaining({ correct: 1, total: 1, passed: true }),
    );
  });

  it('supports multi-select toggling on and off', () => {
    const onFinish = jest.fn();
    render(<QuizRunner questions={multi} mode="practice" onFinish={onFinish} />);
    expect(screen.getByText('Select all that apply')).toBeTruthy();
    fireEvent.press(screen.getByTestId('option-0'));
    fireEvent.press(screen.getByTestId('option-1'));
    fireEvent.press(screen.getByTestId('option-2'));
    fireEvent.press(screen.getByTestId('option-2')); // toggle off
    fireEvent.press(screen.getByTestId('check-button'));
    fireEvent.press(screen.getByTestId('advance-button'));
    expect(onFinish).toHaveBeenCalledWith(
      expect.objectContaining({ correct: 1, total: 1, passed: true }),
    );
  });

  it('runs an exam without feedback across multiple questions', () => {
    const onFinish = jest.fn();
    render(<QuizRunner questions={two} mode="exam" onFinish={onFinish} />);
    expect(screen.queryByTestId('check-button')).toBeNull();
    fireEvent.press(screen.getByTestId('option-0')); // Q1 correct
    fireEvent.press(screen.getByTestId('advance-button')); // Next
    fireEvent.press(screen.getByTestId('option-1')); // Q2 correct
    fireEvent.press(screen.getByTestId('advance-button')); // Finish
    expect(onFinish).toHaveBeenCalledWith(
      expect.objectContaining({ correct: 2, total: 2, passed: true }),
    );
  });
});
