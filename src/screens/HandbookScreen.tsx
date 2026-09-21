import React from 'react';
import { ScrollView, Text, TouchableOpacity } from 'react-native';
import { styles } from '../app/theme';
import { MainRoute } from '../navigation/routes';

export interface HandbookScreenProps {
  onNavigate(route: MainRoute): void;
}

interface Section {
  heading: string;
  body: string;
}

const SECTIONS: Section[] = [
  {
    heading: 'The values and principles of the UK',
    body: 'Democracy, the rule of law, individual liberty, and tolerance of those with different faiths and beliefs are fundamental principles of British life.',
  },
  {
    heading: 'A long and illustrious history',
    body: 'From the Battle of Hastings in 1066 and Magna Carta in 1215 to the present day, the UK’s history shapes its institutions and culture.',
  },
  {
    heading: 'A modern, thriving society',
    body: 'The UK is made up of four countries, uses pound sterling, and celebrates patron saints’ days and national customs across its nations.',
  },
  {
    heading: 'Government, the law and your role',
    body: 'The UK is a parliamentary democracy with a monarch as head of state. Parliament has two Houses: the Commons and the Lords.',
  },
];

/** Static study handbook summarising the official material. Free for all users. */
export function HandbookScreen({ onNavigate }: HandbookScreenProps): React.JSX.Element {
  return (
    <ScrollView style={styles.screen}>
      <Text style={styles.title}>Study handbook</Text>
      {SECTIONS.map((section) => (
        <TouchableOpacity key={section.heading} style={styles.card} activeOpacity={1}>
          <Text style={styles.prompt}>{section.heading}</Text>
          <Text style={styles.optionText}>{section.body}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity testID="handbook-home" onPress={() => onNavigate('Home')}>
        <Text style={styles.secondaryText}>Back to home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
