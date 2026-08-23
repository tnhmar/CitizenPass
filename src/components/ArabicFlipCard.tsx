import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { Text, Button, useTheme } from "react-native-paper";
import { useTranslation } from "react-i18next";
import type { ArabicTranslation } from "../types";

const OPTION_LETTERS = ["A", "B", "C", "D"];
const FLIP_DURATION_MS = 400;

type ArabicFlipCardProps = {
  /** Settings-store toggle. When false, this renders `front` directly with zero overhead. */
  enabled: boolean;
  /** This question's Arabic translation, if the rollout has reached it yet. */
  arabic: ArabicTranslation | undefined;
  /**
   * Whether to reveal the Arabic explanation yet. Should mirror whatever
   * condition reveals the explanation on the front face (e.g. hasAnswered)
   * — the Arabic side must never show the explanation before the user has
   * committed to an answer, or it becomes an answer-peeking shortcut.
   */
  showExplanation: boolean;
  /** The existing front-face content (question + options), unchanged. */
  front: ReactNode;
  style?: object;
};

/**
 * Deliberately built on React Native's built-in Animated API, not
 * react-native-reanimated (not a project dependency, and adding it means a
 * native rebuild). The two faces rotate in lockstep 180° apart with
 * backfaceVisibility: "hidden", which is the standard cross-platform RN
 * flip-card technique — at any point in the animation only one face is
 * ever showing its front side.
 *
 * Both faces are measured via onLayout and the container is pinned to the
 * taller of the two, so a shorter Arabic face (before an answer, before
 * showExplanation) can't visually collapse the layout, and a taller one
 * (after showExplanation adds a paragraph) can't get clipped.
 */
export function ArabicFlipCard({ enabled, arabic, showExplanation, front, style }: ArabicFlipCardProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [flipped, setFlipped] = useState(false);
  const [frontHeight, setFrontHeight] = useState(0);
  const [backHeight, setBackHeight] = useState(0);
  const flipAnim = useRef(new Animated.Value(0)).current;

  if (!enabled || !arabic) {
    return <View style={style}>{front}</View>;
  }

  const toggleFlip = () => {
    const next = !flipped;
    setFlipped(next);
    Animated.timing(flipAnim, {
      toValue: next ? 1 : 0,
      duration: FLIP_DURATION_MS,
      useNativeDriver: true,
    }).start();
  };

  const frontRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
  const backRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ["180deg", "360deg"] });
  const measuredHeight = Math.max(frontHeight, backHeight);

  return (
    <View style={style}>
      <Button
        mode="outlined"
        icon={flipped ? "arrow-left-circle-outline" : "translate"}
        onPress={toggleFlip}
        style={styles.flipButton}
      >
        {flipped
          ? `العودة إلى السؤال / ${t("practice.backToQuestionButton")}`
          : `مساعدة بالعربية / ${t("practice.arabicHelpButton")}`}
      </Button>

      <View style={[styles.flipContainer, measuredHeight ? { height: measuredHeight } : null]}>
        <Animated.View
          style={[styles.face, { transform: [{ rotateY: frontRotate }] }]}
          pointerEvents={flipped ? "none" : "auto"}
          onLayout={(e) => setFrontHeight(e.nativeEvent.layout.height)}
        >
          {front}
        </Animated.View>

        <Animated.View
          style={[styles.face, styles.backFace, { transform: [{ rotateY: backRotate }] }]}
          pointerEvents={flipped ? "auto" : "none"}
          onLayout={(e) => setBackHeight(e.nativeEvent.layout.height)}
        >
          <View
            style={[
              styles.arabicCard,
              { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outline },
            ]}
          >
            <Text variant="titleMedium" style={styles.rtlText}>
              {arabic.question}
            </Text>
            {arabic.options.map((option, index) => (
              <Text key={index} variant="bodyLarge" style={styles.rtlText}>
                {option} .{OPTION_LETTERS[index]}
              </Text>
            ))}
            {showExplanation ? (
              <Text variant="bodyMedium" style={[styles.rtlText, styles.explanationSpacing]}>
                💡 {arabic.explanation}
              </Text>
            ) : null}
            <Text
              variant="bodySmall"
              style={[styles.rtlText, styles.noteSpacing, { color: theme.colors.onSurfaceVariant }]}
            >
              {t("practice.arabicReadOnly")}
            </Text>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flipButton: { marginBottom: 10, alignSelf: "flex-start" },
  flipContainer: { position: "relative" },
  face: { backfaceVisibility: "hidden", width: "100%" },
  backFace: { position: "absolute", top: 0, left: 0, right: 0 },
  arabicCard: { borderWidth: 1, borderRadius: 14, padding: 16, gap: 10 },
  rtlText: { writingDirection: "rtl", textAlign: "right" },
  explanationSpacing: { marginTop: 6 },
  noteSpacing: { marginTop: 10, fontStyle: "italic" },
});
