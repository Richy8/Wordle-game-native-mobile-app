import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { colors, CLEAR, ENTER } from "./src/constants";
import wordList from "./src/wordlist";
import Keyboard from "./src/components/Keyboard";

const numberOfTries = 6;
const copyRows = (arr) => [...arr.map((rows) => [...rows])];

export default function App() {
  const [word, setWord] = useState("");
  const [letters, setLetters] = useState([]);

  const [rows, setRows] = useState(
    new Array(numberOfTries).fill(new Array(letters.length).fill(""))
  );
  const [curRow, setCurRow] = useState(0);
  const [curCol, setCurCol] = useState(0);

  const [greenCaps, setGreenCaps] = useState([]);
  const [yellowCaps, setYellowCaps] = useState([]);
  const [greyCaps, setGreyCaps] = useState([]);

  const generateNewWord = () =>
    wordList[Math.floor(Math.random() * wordList.length)];

  useEffect(() => {
    setWord(generateNewWord());
    setLetters(word.split(""));
    setRows(new Array(numberOfTries).fill(new Array(letters.length).fill("")));
  }, []);

  /**
   * If the row and column passed in are the same as the current row and column, return true, otherwise
   * return false.
   * @param row - the row index of the cell
   * @param col - The column index of the cell.
   * @returns The function isCellActive is being returned.
   */
  const isCellActive = (row, col) => {
    return row === curRow && col === curCol;
  };

  /**
   * It returns true if the current column is the last column and the current column has content
   * @returns The function isLastContent is returning a boolean value.
   */
  const isLastContent = () => {
    return curCol + 1 === letters.length && rows[curRow][curCol].length;
  };

  /**
   * If the letter is the same as the letter in the current row, return the primary color. If the letter
   * is in the letters array, return the secondary color. Otherwise, return the dark grey color
   * @param letter - the letter in the cell
   * @param row - the current row
   * @param col - the column number of the cell
   * @returns The background color of the cell.
   */
  const getCellBgColor = (letter, row, col) => {
    if (row >= curRow) return;

    if (letter === letters[col]) return colors.primary;
    else if (letters.includes(letter)) return colors.secondary;
    else return colors.darkgrey;
  };

  /**
   * It resets the state of the keyboard caps to their default values
   */
  const resetKeyboardCaps = () => {
    setGreenCaps([]);
    setYellowCaps([]);
    setGreyCaps([]);
  };

  const updateKeybardBgCaps = () => {
    resetKeyboardCaps();

    let greenKeys = [],
      yellowKeys = [],
      greyKeys = [];

    rows.map((row) =>
      row.map((cell, col) => {
        if (cell.length) {
          if (cell === letters[col]) greenKeys.push(cell);
          else if (letters.includes(cell)) yellowKeys.push(cell);
          else greyKeys.push(cell);
        }
      })
    );

    setGreenCaps(greenKeys);
    setYellowCaps(yellowKeys);
    setGreyCaps(greyKeys);
  };

  /**
   * If the current column is the last column, then clear the current column. Otherwise, clear the
   * previous column
   * @returns the value of the variable curCol.
   */
  const checkClearKey = () => {
    let prevCol = curCol - 1;

    if (isLastContent()) {
      updateWordRow(curRow, curCol, "");
      setCurCol(curCol);
      return;
    }

    if (prevCol >= 0) {
      updateWordRow(curRow, prevCol, "");
      setCurCol(prevCol);
    }
    return;
  };

  const checkIfWon = () => {
    const trialWord = rows[curRow].join("");

    if (word === trialWord) {
      Alert.alert(
        "Hooray!, you've won",
        "Nice one, you were able to guess the word right, try out another one.",
        [
          {
            text: "Cancel",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel",
          },
          { text: "New word", onPress: () => console.log("OK Pressed") },
        ]
      );
      return true;
    }
  };

  const checkIfLost = () => {
    Alert.alert(
      "Ooops!, you've lost",
      "You were not able to guess the word correctly, try again.",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        { text: "Try again", onPress: () => console.log("OK Pressed") },
      ]
    );
    return true;
  };

  /**
   * If the current content is the last content in the current row, then increment the current row and
   * set the current column to 0
   * @returns Nothing.
   */
  const checkEnterKey = () => {
    if (isLastContent()) {
      if (curRow + 1 === numberOfTries) {
        if (checkIfWon()) return;
        else checkIfLost();
        return;
      } else {
        setCurRow(curRow + 1);
        setCurCol(0);

        updateKeybardBgCaps();
        if (checkIfWon()) return;
      }
    }
    return;
  };

  /**
   * It takes a row, column, and key, and updates the rows array with the key at the given row and
   * column
   * @param row - the row number of the cell that was clicked
   * @param col - the column number of the cell that was clicked
   * @param key - the key that was pressed
   */
  const updateWordRow = (row, col, key) => {
    let updatedRows = copyRows(rows);
    updatedRows[row][col] = key;
    setRows(updatedRows);
  };

  const updateRowCell = () => {
    if (curCol + 1 !== letters.length) {
      setCurCol(curCol + 1);
      return;
    }
  };

  const keyPressed = (key) => {
    if (key === CLEAR) {
      checkClearKey();
      return;
    }

    if (key === ENTER) {
      checkEnterKey();
      return;
    }

    if ([false, 0].includes(isLastContent())) {
      updateWordRow(curRow, curCol, key);
      updateRowCell();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.title}>WORDLE</Text>

      <ScrollView style={styles.wordWrapper}>
        {rows.map((row, i) => (
          <View style={styles.wordRow} key={i}>
            {row.map((cell, j) => (
              <View
                key={j}
                style={[
                  styles.wordCell,
                  {
                    borderColor: isCellActive(i, j)
                      ? colors.lightgrey
                      : colors.darkgrey,
                    backgroundColor: getCellBgColor(cell, i, j),
                  },
                ]}
              >
                <Text style={styles.word}>{cell.toUpperCase()}</Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      <Keyboard
        onKeyPressed={keyPressed}
        greenCaps={greenCaps}
        yellowCaps={yellowCaps}
        greyCaps={greyCaps}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
    alignItems: "center",
    paddingTop: Platform.OS === "android" && 55,
  },

  title: {
    color: colors.lightgrey,
    fontSize: 32,
    fontWeight: "bold",
    letterSpacing: 7,
  },

  wordWrapper: {
    alignSelf: "stretch",
    marginVertical: 25,
    marginHorizontal: 5,
  },

  wordRow: {
    flexDirection: "row",
    alignSelf: "stretch",
    justifyContent: "center",
  },

  wordCell: {
    borderWidth: 2,
    borderRadius: 4,
    borderColor: colors.darkgrey,
    margin: 2,
    flex: 1,
    aspectRatio: 1,
    maxWidth: 65,
    justifyContent: "center",
    alignItems: "center",
  },

  word: {
    color: colors.lightgrey,
    fontSize: 28,
    fontWeight: "bold",
  },
});
