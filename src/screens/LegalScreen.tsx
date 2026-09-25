import React from 'react';
import { Pressable, ScrollView, Text } from 'react-native';
import { pressFade } from '../app/press';
import { styles } from '../app/theme';
import { LegalDocument } from '../content/legal';
import { MainRoute } from '../navigation/routes';

export interface LegalScreenProps {
  document: LegalDocument;
  onNavigate(route: MainRoute): void;
}

/** Renders a legal/informational document (privacy, terms, disclaimer). */
export function LegalScreen({ document, onNavigate }: LegalScreenProps): React.JSX.Element {
  return (
    <ScrollView style={styles.screen}>
      <Text style={styles.title}>{document.title}</Text>
      <Text style={styles.label} testID="legal-updated">
        Last updated: {document.updated}
      </Text>
      {document.paragraphs.map((paragraph, index) => (
        <Text key={index} style={styles.optionText} testID={`legal-paragraph-${index}`}>
          {`\n${paragraph}`}
        </Text>
      ))}
      <Pressable testID="legal-back" style={pressFade} onPress={() => onNavigate('Settings')}>
        <Text style={styles.secondaryText}>Back</Text>
      </Pressable>
    </ScrollView>
  );
}
