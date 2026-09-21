import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { HandbookScreen } from './HandbookScreen';

describe('HandbookScreen', () => {
  it('renders the study sections and navigates home', () => {
    const onNavigate = jest.fn();
    render(<HandbookScreen onNavigate={onNavigate} />);
    expect(screen.getByText('Study handbook')).toBeTruthy();
    expect(screen.getByText('The values and principles of the UK')).toBeTruthy();
    fireEvent.press(screen.getByTestId('handbook-home'));
    expect(onNavigate).toHaveBeenCalledWith('Home');
  });
});
