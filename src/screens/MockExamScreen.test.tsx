import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { makeServices, renderWithApp } from '../testkit';
import { FREE_EXAM_SIZE, MockExamScreen } from './MockExamScreen';

function answerExam(count: number): void {
  for (let i = 0; i < count; i += 1) {
    fireEvent.press(screen.getByTestId('option-0'));
    fireEvent.press(screen.getByTestId('advance-button'));
  }
}

describe('MockExamScreen', () => {
  it('shows the free upsell and navigates to the paywall', () => {
    const onNavigate = jest.fn();
    renderWithApp(<MockExamScreen onNavigate={onNavigate} />, makeServices());
    fireEvent.press(screen.getByTestId('exam-upsell'));
    expect(onNavigate).toHaveBeenCalledWith('Paywall');
  });

  it('records progress and shows results, then retries', async () => {
    const services = makeServices();
    const onNavigate = jest.fn();
    renderWithApp(<MockExamScreen onNavigate={onNavigate} />, services);

    answerExam(FREE_EXAM_SIZE);
    await waitFor(() => expect(screen.getByTestId('results-verdict')).toBeTruthy());
    expect((await services.progress.get()).attempts).toBe(1);

    fireEvent.press(screen.getByTestId('home-button'));
    expect(onNavigate).toHaveBeenCalledWith('Home');

    fireEvent.press(screen.getByTestId('retry-button'));
    expect(screen.getByTestId('quiz-runner')).toBeTruthy();
  });

  it('hides the upsell for premium users', async () => {
    const services = makeServices();
    await services.entitlements.grantPremium();
    renderWithApp(<MockExamScreen onNavigate={jest.fn()} />, services);
    await waitFor(() => expect(screen.queryByTestId('exam-upsell')).toBeNull());
    expect(screen.getByTestId('quiz-runner')).toBeTruthy();
  });
});
