const consonants = [
  'B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Z'
];
const doubleConsonants = consonants.map(letter => letter + letter);
const consonantPairs = [
  'BL', 'BR', 'CH', 'CK', 'CL', 'CR', 'DR', 'FL', 'FR', 'GH', 'GL', 'GR', 'KL', 'KR', 'KW', 'PF',
  'PL', 'PR', 'SC', 'SH', 'SK', 'SL', 'SM', 'SN', 'SP', 'SQ', 'ST', 'SW', 'TH', 'TR', 'TW', 'WH', 'WR'
];
const consonantDoublesAndPairs = doubleConsonants.concat(consonantPairs);
const consonantTriples = ['SCH', 'SCR', 'SHR', 'THR',]
const vowels = ['A', 'E', 'I', 'O', 'U', 'Y'];
const vowelPairs = ['AI', 'AY', 'EA', 'EE', 'EO', 'IO', 'OA', 'OO', 'OY', 'YA', 'YO', 'YU'];

const consonantRegEx = new RegExp(`(${consonants.join('|')})`);
const consonantDoublesAndPairsRegEx = new RegExp(`(${consonantDoublesAndPairs.join('|')})`);
const consonantTriplesRegEx = new RegExp(`(${consonantTriples.join('|')})`);
const vowelRegEx = new RegExp(`(${vowels.join('|')})`)
const vowelPairsRegex = new RegExp(`(${vowelPairs.join('|')})`);
const allAcceptedCharactersRegEx = /^[A-Z]+$/;

const isConsonant = letter => consonantRegEx.test(letter);
const isVowel = letter => vowelRegEx.test(letter);

const wordHasOnlyAcceptedCharacters = word => allAcceptedCharactersRegEx.test(word);
const wordsContainOnlyAcceptedCharacters = (word1, word2) => {
  return wordHasOnlyAcceptedCharacters(word1) && wordHasOnlyAcceptedCharacters(word2);
};

const difficultyMap = (scrambled, unscrambled) => {
  const difficulty = {
    not: `${scrambled} is not a scramble of ${unscrambled}`,
    poor: `${scrambled} is a poor scramble of ${unscrambled}`,
    fair: `${scrambled} is a fair scramble of ${unscrambled}`,
    hard: `${scrambled} is a hard scramble of ${unscrambled}`,
  };
  return {
    getSentence: level => difficulty[level],
  }
}

const doesScrambleLookReal = (scrambled, type) => {
  if (scrambled.length <= 1) {
    return true;
  }
  if (type === 'not') {
    return false;
  }
  const firstLetter = scrambled[0];
  const secondLetter = scrambled[1];
  const thirdLetter = scrambled[2];
  const fourthLetter = scrambled[3];
  const scrambledFrom1stLetter = scrambled.slice(0);
  const scrambledFrom2ndLetter = scrambled.slice(1);
  const scrambledFrom3rdLetter = scrambled.slice(2);
  const scrambledFrom4thLetter = scrambled.slice(3);
  const functions = {
    consonant: () => {
      return isVowel(secondLetter)
        ? doesScrambleLookReal( scrambledFrom2ndLetter, 'vowel' )
        : isVowel(thirdLetter)
          ? doesScrambleLookReal( scrambledFrom1stLetter, 'conPair' )
          : doesScrambleLookReal( scrambledFrom1stLetter, 'conTrip' );
    },
    conTrip: () => {
      const match = consonantTriplesRegEx.exec(scrambled);
      return match && match.index === 0 && isVowel(fourthLetter)
        ? doesScrambleLookReal( scrambledFrom4thLetter, 'vowel' )
        : doesScrambleLookReal(scrambled, 'not');
    },
    conPair: () => {
      const match = consonantDoublesAndPairsRegEx.exec(scrambled);
      return match && match.index === 0
        ? doesScrambleLookReal( scrambledFrom3rdLetter, 'vowel' )
        : doesScrambleLookReal(scrambled, 'not');
    },
    vowel: () => {
      return isConsonant(secondLetter)
        ? doesScrambleLookReal( scrambledFrom2ndLetter, 'consonant' )
        : doesScrambleLookReal( scrambledFrom1stLetter, 'vowPair' );
    },
    vowPair: () => {
      const match = vowelPairsRegex.exec(scrambled);
      return match && match.index === 0 && isConsonant(thirdLetter)
        ? doesScrambleLookReal( scrambledFrom3rdLetter, 'consonant' )
        : doesScrambleLookReal(scrambled, 'not');
    },
  }
  return functions[type]();
}

isLetterInCorrectPlace = (scrambled, unscrambled, i) => scrambled[i] === unscrambled[i];
isFirstLetterCorrect = (scrambled, unscrambled) => isLetterInCorrectPlace(scrambled, unscrambled, 0);

hasPairInCorrectPlace = (scrambled, unscrambled) => {
  const reduced = scrambled.split('').reduce((acc, cur, i) => {
    if (i !== scrambled.length) {
      if ( isLetterInCorrectPlace(scrambled, unscrambled, i) && isLetterInCorrectPlace(scrambled, unscrambled, i + 1) ) {
        acc.pairInCorrectPlace = true;
      }
      return acc;
    }
  }, {pairInCorrectPlace: false});
  return reduced.pairInCorrectPlace;
}

const areWordsEqual = (word1, word2) => word1 === word2;

const determineScrambleDifficulty = str => {
  const [ scrambledWord, unscrambledWord ] = str.split(' ');
  if (!wordsContainOnlyAcceptedCharacters(scrambledWord, unscrambledWord) ) {
    return `Error: Must only use capital letters and no special characters or numbers. Your words: ${scrambledWord}, ${unscrambledWord}`;
  };
  if (scrambledWord.length !== unscrambledWord.length) {
    return `Error: Words must be the same length. Your words: ${scrambledWord}, ${unscrambledWord}`;
  };

  const sentenceMap = difficultyMap(scrambledWord, unscrambledWord);
  const { getSentence } = sentenceMap;
  if ( areWordsEqual(scrambledWord, unscrambledWord) ) return getSentence('not');

  const looksReal = isConsonant(scrambledWord[0])
                  ? doesScrambleLookReal(scrambledWord, 'consonant')
                  : doesScrambleLookReal(scrambledWord, 'vowel');
  const firstLetterOr2ConsecLettersInPlace = isFirstLetterCorrect(scrambledWord, unscrambledWord) || hasPairInCorrectPlace(scrambledWord, unscrambledWord);
  const poor = !looksReal && firstLetterOr2ConsecLettersInPlace;
  const hard = looksReal && !firstLetterOr2ConsecLettersInPlace;
  const fair = !poor && !hard ? true : false;
  return !fair
    ? hard
      ? getSentence('hard')
      : getSentence('poor')
    : getSentence('fair')
}

const getScrambleDifficulties = arr => {
  if ( arr.length <= 0 || !Array.isArray(arr) ) return 'Error: Must pass an array of capitalized strings, such as [\'APMS SPAM\']';
  return arr.map(item => determineScrambleDifficulty(item));
}

const scrambles = ['MAPS SPAM', 'RIONY IRONY', 'ONYRI IRONY', 'IRONY IRONY', 'INOYR IRONY', 'IOYRN IRONY', 'IRON IRONY', 'iRONY IRONY', '1RONY IRONY'];

const difficulties = getScrambleDifficulties(scrambles);

console.log('difficulties: ', difficulties);
