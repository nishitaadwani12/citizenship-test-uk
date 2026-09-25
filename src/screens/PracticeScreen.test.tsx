import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { accessibleQuestions } from '../core/access';
import { UK_QUESTIONS } from '../core/questionBank';
import { makeServices, renderWithApp } from '../testkit';
import { PracticeScreen } from './PracticeScreen';

const FREE_COUNT = accessibleQuestions(UK_QUESTIONS, false).length;

function answerAll(count: number): void {
  for (let i = 0; i < count; i += 1) {
    fireEvent.press(screen.getByTestId('option-0'));
    fireEvent.press(screen.getByTestId('check-button'));
    fireEvent.press(screen.getByTestId('advance-button'));
  }
}

describe('PracticeScreen', () => {
  it('shows the free upsell and navigates to the paywall', () => {
    const onNavigate = jest.fn();
    renderWithApp(<PracticeScreen onNavigate={onNavigate} />, makeServices());
    fireEvent.press(screen.getByTestId('practice-upsell'));
    expect(onNavigate).toHaveBeenCalledWith('Paywall');
  });

  it('navigates home via the back link', () => {
    const onNavigate = jest.fn();
    renderWithApp(<PracticeScreen onNavigate={onNavigate} />, makeServices());
    fireEvent.press(screen.getByTestId('practice-back'));
    expect(onNavigate).toHaveBeenCalledWith('Home');
  });

  it('completes a run, shows results, and retries', () => {
    const onNavigate = jest.fn();
    renderWithApp(<PracticeScreen onNavigate={onNavigate} />, makeServices());
    answerAll(FREE_COUNT);
    expect(screen.getByTestId('results-verdict')).toBeTruthy();

    fireEvent.press(screen.getByTestId('home-button'));
    expect(onNavigate).toHaveBeenCalledWith('Home');

    fireEvent.press(screen.getByTestId('retry-button'));
    expect(screen.getByTestId('quiz-runner')).toBeTruthy();
  });

  it('hides the upsell for premium users', async () => {
    const services = makeServices();
    await services.entitlements.grantPremium();
    renderWithApp(<PracticeScreen onNavigate={jest.fn()} />, services);
    await waitFor(() => expect(screen.queryByTestId('practice-upsell')).toBeNull());
    expect(screen.getByTestId('quiz-runner')).toBeTruthy();
  });
});
