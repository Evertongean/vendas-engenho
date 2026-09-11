import { useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

import { useTheme } from "@/hooks/use-theme";
import type { Product } from "@/types/sale";
import { formatCurrency } from "@/utils/money";

interface ProductCardProps {
  product: Product;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
  onClear: () => void;
  onChangeQuantity: (value: string) => void;
}

export default function ProductCard({
  product,
  quantity,
  onAdd,
  onRemove,
  onClear,
  onChangeQuantity,
}: ProductCardProps) {
  const colors = useTheme();
  const { height, width } = useWindowDimensions();
  const metrics = useMemo(() => {
    const veryShort = height < 680;
    const tall = height >= 820;
    const narrow = width < 360;

    return {
      cardPaddingVertical: veryShort ? 6 : tall ? 14 : 10,
      cardPaddingHorizontal: narrow ? 10 : tall ? 16 : 12,
      productNameFont: veryShort ? 15 : tall ? 17 : 16,
      productPriceFont: veryShort ? 12 : tall ? 14 : 13,
      controlSize: veryShort ? 42 : tall ? 48 : 44,
      quantityFont: veryShort ? 20 : tall ? 23 : 22,
      quantityWidth: narrow ? 38 : 44,
    };
  }, [height, width]);
  const styles = useMemo(() => createStyles(colors, metrics), [colors, metrics]);

  return (
    <View style={styles.card}>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product.name}</Text>

        <Text style={styles.productPrice}>
          {formatCurrency(product.unitPrice)}
        </Text>
      </View>

      <View style={styles.quantityContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.quantityButton,
            pressed && styles.quantityButtonPressed,
          ]}
          onPress={onRemove}
          onLongPress={onClear}
          delayLongPress={500}
        >
          <Text style={styles.buttonText}>-</Text>
        </Pressable>

        <TextInput
          style={styles.quantityInput}
          value={String(quantity)}
          onChangeText={onChangeQuantity}
          keyboardType="number-pad"
          selectTextOnFocus
          placeholderTextColor={colors.textSecondary}
        />

        <Pressable
          style={({ pressed }) => [
            styles.quantityButton,
            pressed && styles.quantityButtonPressed,
          ]}
          onPress={onAdd}
        >
          <Text style={styles.buttonText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(
  colors: ReturnType<typeof useTheme>,
  metrics: {
    cardPaddingVertical: number;
    cardPaddingHorizontal: number;
    productNameFont: number;
    productPriceFont: number;
    controlSize: number;
    quantityFont: number;
    quantityWidth: number;
  }
) {
  return StyleSheet.create({
    card: {
      height: 98,
      backgroundColor: colors.card,
      borderRadius: 8,
      paddingVertical: metrics.cardPaddingVertical,
      paddingHorizontal: metrics.cardPaddingHorizontal,

      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",

      borderWidth: 1,
      borderColor: colors.border,
      elevation: 2,

      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },

    productInfo: {
      flex: 1,
      paddingRight: 8,
    },

    productName: {
      fontSize: metrics.productNameFont,
      lineHeight: metrics.productNameFont + 4,
      fontWeight: "700",
      color: colors.text,
    },

    productPrice: {
      fontSize: metrics.productPriceFont,
      lineHeight: metrics.productPriceFont + 3,
      color: colors.textSecondary,
      marginTop: 1,
    },

    quantityContainer: {
      flexDirection: "row",
      alignItems: "center",
    },

    quantityButton: {
      width: metrics.controlSize,
      height: metrics.controlSize,
      borderRadius: metrics.controlSize / 2,
      backgroundColor: colors.backgroundElement,

      justifyContent: "center",
      alignItems: "center",
    },

    quantityButtonPressed: {
      backgroundColor: colors.backgroundSelected,
      opacity: 0.72,
    },

    buttonText: {
      fontSize: metrics.quantityFont + 4,
      lineHeight: metrics.quantityFont + 6,
      color: colors.text,
      fontWeight: "700",
    },

    quantityInput: {
      fontSize: metrics.quantityFont,
      fontWeight: "700",
      width: metrics.quantityWidth,
      height: metrics.controlSize,
      textAlign: "center",
      color: colors.text,
      padding: 0,
      marginHorizontal: 6,
    },
  });
}
