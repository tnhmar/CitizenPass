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
 * The option row is deliberately built with a flex row (View), NOT a
 * single run of bidi text. Android has a documented bug where
 * writingDirection on nested <Text> spans inside an RTL paragraph is not
 * respected, so the option letter gets silently reordered by the Unicode
 * bidi algorithm regardless of the style we set
 * (facebook/react-native#17361). A flex layout sidesteps that entirely:
 * children are positioned by explicit geometry, not text-direction
 * inference. `direction: "ltr"` on the row additionally guards against
 * React Native's automatic flexDirection mirroring when
 * I18nManager.isRTL is true elsewhere in the app, so this row's physical
 * layout — Arabic answer text, then the letter pinned to the row's right
 * edge via justifyContent: "flex-end" — stays stable no matter the app's
 * global RTL/LTR setting.
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
              <View key={OPTION_LETTERS[index]} style={styles.arabicOptionRow}>
                <Text style={styles.optionAnswerText}>{option}</Text>
                <Text style={styles.optionLetter}> -{OPTION_LETTERS[index]}</Text>
              </View>
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
  arabicOptionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    // @ts-expect-error RN's ViewStyle type doesn't list `direction` on older
    // type defs even though it's a supported native style prop; it forces
    // this row's layout direction explicitly instead of inheriting
    // I18nManager's global RTL/LTR mirroring.
    direction: "ltr",
    marginBottom: 6,
  },
  optionAnswerText: {
    writingDirection: "rtl",
    textAlign: "right",
  },
  optionLetter: {
    writingDirection: "ltr",
    fontWeight: "600",
  },
  explanationSpacing: { marginTop: 6 },
  noteSpacing: { marginTop: 10, fontStyle: "italic" },
});
