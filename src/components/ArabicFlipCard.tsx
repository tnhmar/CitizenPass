import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { Animated, StyleSheet, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
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
  style?: StyleProp<ViewStyle>;
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
 * (after showExplanation adds a paragraph) can't get clipped. Heights start
 * as `undefined` (auto) rather than 0, so the container doesn't visibly
 * collapse-then-pop on first mount before onLayout fires.
 *
 * The option row uses NESTED inline <Text> instead of a flexDirection-based
 * row. This matters: flexDirection "row"/"row-reverse" on a <View> gets
 * silently auto-mirrored by React Native when I18nManager.isRTL is true,
 * which would flip the letter to the wrong side regardless of what we pick.
 * Nested inline Text runs are NOT subject to that View-level mirroring —
 * the parent Text carries writingDirection: "rtl", and the letter is a
 * separate inner Text run marked writingDirection: "ltr". In an RTL
 * paragraph, the first logical run renders at the visual right, so the
 * letter (declared first in JSX) reliably lands at the right edge with the
 * Arabic answer continuing to its left — independent of the app's global
 * RTL/LTR setting.
 */
export function ArabicFlipCard({ enabled, arabic, showExplanation, front, style }: ArabicFlipCardProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [flipped, setFlipped] = useState(false);
  const [frontHeight, setFrontHeight] = useState<number | undefined>(undefined);
  const [backHeight, setBackHeight] = useState<number | undefined>(undefined);
  const flipAnim = useRef(new Animated.Value(0)).current;
  const isAnimating = useRef(false);

  if (!enabled || !arabic) {
    return <View style={style}>{front}</View>;
  }

  const toggleFlip = () => {
    if (isAnimating.current) return;
    const next = !flipped;
    setFlipped(next);
    isAnimating.current = true;
    Animated.timing(flipAnim, {
      toValue: next ? 1 : 0,
      duration: FLIP_DURATION_MS,
      useNativeDriver: true,
    }).start(() => {
      isAnimating.current = false;
    });
  };

  const frontRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
  const backRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ["180deg", "360deg"] });
  const measuredHeight = frontHeight !== undefined && backHeight !== undefined
    ? Math.max(frontHeight, backHeight)
    : undefined;

  return (
    <View style={style}>
      <Button mode="text" onPress={toggleFlip} style={styles.flipButton} compact>
        {flipped
          ? `العودة إلى السؤال / ${t("practice.backToQuestionButton")}`
          : `مساعدة بالعربية / ${t("practice.arabicHelpButton")}`}
      </Button>

      <View style={[styles.flipContainer, measuredHeight ? { height: measuredHeight } : null]}>
        <Animated.View
          style={[styles.face, { transform: [{ rotateY: frontRotate }] }]}
          onLayout={(e) => setFrontHeight(e.nativeEvent.layout.height)}
        >
          {front}
        </Animated.View>

        <Animated.View
          style={[styles.face, styles.backFace, { transform: [{ rotateY: backRotate }] }]}
          onLayout={(e) => setBackHeight(e.nativeEvent.layout.height)}
        >
          <View style={[styles.arabicCard, { borderColor: theme.colors.outline }]}>
            <Text style={styles.rtlText}>{arabic.question}</Text>

            {arabic.options.map((option, index) => (
              <Text key={OPTION_LETTERS[index]} style={[styles.rtlText, styles.optionSpacing]}>
                <Text style={styles.optionLetter}>{OPTION_LETTERS[index]}- </Text>
                {option}
              </Text>
            ))}

            {showExplanation ? (
              <Text style={[styles.rtlText, styles.explanationSpacing]}>
                💡 {arabic.explanation}
              </Text>
            ) : null}

            <Text style={[styles.rtlText, styles.noteSpacing]}>
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
  optionSpacing: { marginBottom: 6 },
  optionLetter: { writingDirection: "ltr", fontWeight: "600" },
  explanationSpacing: { marginTop: 6 },
  noteSpacing: { marginTop: 10, fontStyle: "italic" },
});
