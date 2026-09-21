import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { PRIVACY_POLICY } from '../content/legal';
import { LegalScreen } from './LegalScreen';

describe('LegalScreen', () => {
  it('renders the document title, date, paragraphs and a back action', () => {
    const onNavigate = jest.fn();
    render(<LegalScreen document={PRIVACY_POLICY} onNavigate={onNavigate} />);
    expect(screen.getByText(PRIVACY_POLICY.title)).toBeTruthy();
    expect(screen.getByTestId('legal-updated')).toHaveTextContent(
      `Last updated: ${PRIVACY_POLICY.updated}`,
    );
    expect(screen.getByTestId('legal-paragraph-0')).toBeTruthy();
    fireEvent.press(screen.getByTestId('legal-back'));
    expect(onNavigate).toHaveBeenCalledWith('Settings');
  });
});
