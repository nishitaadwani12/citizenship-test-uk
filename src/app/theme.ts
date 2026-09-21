import { StyleSheet } from 'react-native';

/** Minimal, flat styling shared across screens. Intentionally lightweight. */
export const colors = {
  primary: '#1d3f8f',
  background: '#ffffff',
  surface: '#f2f4f8',
  text: '#111418',
  muted: '#5b6472',
  correct: '#1b7f4b',
  wrong: '#b3261e',
  border: '#d5dae2',
};

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: colors.muted,
    marginBottom: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  prompt: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  option: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
    backgroundColor: colors.background,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: '#e8eefc',
  },
  optionCorrect: {
    borderColor: colors.correct,
    backgroundColor: '#e5f4ec',
  },
  optionWrong: {
    borderColor: colors.wrong,
    backgroundColor: '#fbe9e8',
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: colors.muted,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryText: {
    color: colors.primary,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    color: colors.text,
  },
  error: {
    color: colors.wrong,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 6,
  },
});
