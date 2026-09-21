import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { ResultsView } from './ResultsView';

describe('ResultsView', () => {
  it('shows a passing verdict and score', () => {
    render(
      <ResultsView
        result={{ correct: 20, total: 24, percentage: 83, passed: true }}
        onRetry={jest.fn()}
        onHome={jest.fn()}
      />,
    );
    expect(screen.getByTestId('results-verdict')).toHaveTextContent('You passed! 🎉');
    expect(screen.getByTestId('results-score')).toHaveTextContent(
      'You scored 20 out of 24 (83%)',
    );
  });

  it('shows a failing verdict', () => {
    render(
      <ResultsView
        result={{ correct: 5, total: 24, percentage: 21, passed: false }}
        onRetry={jest.fn()}
        onHome={jest.fn()}
      />,
    );
    expect(screen.getByTestId('results-verdict')).toHaveTextContent('Not quite yet');
  });

  it('fires retry and home callbacks', () => {
    const onRetry = jest.fn();
    const onHome = jest.fn();
    render(
      <ResultsView
        result={{ correct: 5, total: 24, percentage: 21, passed: false }}
        onRetry={onRetry}
        onHome={onHome}
      />,
    );
    fireEvent.press(screen.getByTestId('retry-button'));
    fireEvent.press(screen.getByTestId('home-button'));
    expect(onRetry).toHaveBeenCalled();
    expect(onHome).toHaveBeenCalled();
  });
});
