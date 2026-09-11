import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSale } from "@/context/SaleContext";
import { useTheme } from "@/hooks/use-theme";
import type { SaleRecord } from "@/types/sale";
import { formatCurrency, roundCurrency } from "@/utils/money";
import {
  WEEKDAY_FILTERS,
  formatFullDate,
  formatOperationalWeekRange,
  getOperationalWeekRange,
  isStoredDateInOperationalWeek,
  isStoredDateOnWeekday,
  padDatePart,
  parseStoredDate,
  type WeekdayFilter,
} from "@/utils/week";

function formatSaleTime(createdAt: string) {
  const saleDate = parseStoredDate(createdAt);

  if (!saleDate) {
    return "--:--";
  }

  return `${padDatePart(saleDate.getHours())}:${padDatePart(
    saleDate.getMinutes()
  )}`;
}

function formatSaleDate(createdAt: string) {
  const saleDate = parseStoredDate(createdAt);

  if (!saleDate) {
    return "Data indisponivel";
  }

  return formatFullDate(saleDate);
}

function getPaymentLabel(paymentMethod: SaleRecord["paymentMethod"]) {
  return paymentMethod === "dinheiro" ? "Dinheiro" : "PIX";
}

function getFilterLabel(filter: WeekdayFilter) {
  return WEEKDAY_FILTERS.find((item) => item.value === filter)?.label ?? "Todos";
}

export default function HistoricoScreen() {
  const { sales, salesLoading } = useSale();
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors, insets.top), [colors, insets.top]);
  const [selectedFilter, setSelectedFilter] = useState<WeekdayFilter>("all");
  const [referenceDate, setReferenceDate] = useState(() => new Date());

  useFocusEffect(
    useCallback(() => {
      setReferenceDate(new Date());
    }, [])
  );

  useEffect(() => {
    setReferenceDate(new Date());
  }, [sales]);

  const weekRange = useMemo(
    () => getOperationalWeekRange(referenceDate),
    [referenceDate]
  );

  const weeklySales = useMemo(() => {
    return sales.filter((sale) =>
      isStoredDateInOperationalWeek(sale.createdAt, weekRange)
    );
  }, [sales, weekRange]);

  const filteredSales = useMemo(() => {
    const salesByFilter =
      selectedFilter === "all"
        ? weeklySales
        : weeklySales.filter((sale) =>
            isStoredDateOnWeekday(sale.createdAt, selectedFilter)
          );

    return [...salesByFilter].sort((firstSale, secondSale) => {
      return (
        new Date(secondSale.createdAt).getTime() -
        new Date(firstSale.createdAt).getTime()
      );
    });
  }, [selectedFilter, weeklySales]);

  const summary = useMemo(() => {
    return {
      total: roundCurrency(
        filteredSales.reduce((sum, sale) => sum + sale.total, 0)
      ),
      quantity: filteredSales.length,
      cash: roundCurrency(
        filteredSales
          .filter((sale) => sale.paymentMethod === "dinheiro")
          .reduce((sum, sale) => sum + sale.total, 0)
      ),
      pix: roundCurrency(
        filteredSales
          .filter((sale) => sale.paymentMethod === "pix")
          .reduce((sum, sale) => sum + sale.total, 0)
      ),
    };
  }, [filteredSales]);

  const weekRangeLabel = useMemo(
    () => formatOperationalWeekRange(weekRange),
    [weekRange]
  );
  const selectedFilterLabel = getFilterLabel(selectedFilter);

  function renderFilterButton(filter: (typeof WEEKDAY_FILTERS)[number]) {
    const isSelected = selectedFilter === filter.value;

    return (
      <Pressable
        key={filter.label}
        style={({ pressed }) => [
          styles.filterButton,
          isSelected && styles.filterButtonSelected,
          pressed && styles.filterButtonPressed,
        ]}
        onPress={() => setSelectedFilter(filter.value)}
      >
        <Text
          style={[
            styles.filterButtonText,
            isSelected && styles.filterButtonTextSelected,
          ]}
        >
          {filter.label}
        </Text>
      </Pressable>
    );
  }

  function renderHeader() {
    return (
      <View>
        <View style={styles.header}>
          <Text style={styles.title}>Historico</Text>
          <Text style={styles.subtitle}>Semana atual</Text>
          <Text style={styles.weekRange}>{weekRangeLabel}</Text>
        </View>

        <View style={styles.filterContainer}>
          {WEEKDAY_FILTERS.map(renderFilterButton)}
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total vendido</Text>
            <Text style={styles.summaryValue}>{formatCurrency(summary.total)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Quantidade de vendas</Text>
            <Text style={styles.summaryValue}>{summary.quantity}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Dinheiro</Text>
            <Text style={styles.summaryValue}>{formatCurrency(summary.cash)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>PIX</Text>
            <Text style={styles.summaryValue}>{formatCurrency(summary.pix)}</Text>
          </View>
        </View>

        <Text style={styles.listTitle}>
          {selectedFilter === "all"
            ? "Vendas da semana"
            : `Vendas de ${selectedFilterLabel}`}
        </Text>
      </View>
    );
  }

  function renderSale({ item }: { item: SaleRecord }) {
    return (
      <View style={styles.saleCard}>
        <View style={styles.saleHeader}>
          <View>
            <Text style={styles.saleTime}>{formatSaleTime(item.createdAt)}</Text>
            <Text style={styles.saleDate}>{formatSaleDate(item.createdAt)}</Text>
          </View>

          <Text style={styles.paymentBadge}>
            {getPaymentLabel(item.paymentMethod)}
          </Text>
        </View>

        <View style={styles.itemsContainer}>
          {item.items.map((saleItem) => (
            <View key={`${item.id}-${saleItem.id}`} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemText}>
                  {saleItem.quantity}x {saleItem.name}
                </Text>
                <Text style={styles.itemUnitPrice}>
                  {formatCurrency(saleItem.unitPrice)} un.
                </Text>
              </View>

              <Text style={styles.itemSubtotal}>
                {formatCurrency(saleItem.subtotal)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatCurrency(item.total)}</Text>
        </View>

        {item.paymentMethod === "dinheiro" && (
          <View style={styles.cashDetails}>
            <Text style={styles.paymentDetail}>
              Recebido: {formatCurrency(item.received)}
            </Text>
            <Text style={styles.paymentDetail}>
              Troco: {formatCurrency(item.change)}
            </Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={salesLoading ? [] : filteredSales}
        keyExtractor={(item) => item.id}
        renderItem={renderSale}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {salesLoading
              ? "Carregando historico..."
              : selectedFilter === "all"
              ? "Nenhuma venda nesta semana."
              : "Nenhuma venda neste dia."}
          </Text>
        }
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>, topInset: number) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    content: {
      padding: 20,
      paddingTop: Math.max(topInset + 24, 50),
      paddingBottom: 34,
    },

    header: {
      marginBottom: 14,
    },

    title: {
      fontSize: 30,
      fontWeight: "bold",
      color: colors.text,
    },

    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 5,
    },

    weekRange: {
      fontSize: 15,
      color: colors.text,
      fontWeight: "700",
      marginTop: 3,
    },

    filterContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 16,
    },

    filterButton: {
      minHeight: 38,
      minWidth: 57,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 10,
    },

    filterButtonSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.tabActiveBackground,
    },

    filterButtonPressed: {
      opacity: 0.74,
    },

    filterButtonText: {
      fontSize: 13,
      fontWeight: "800",
      color: colors.textSecondary,
    },

    filterButtonTextSelected: {
      color: colors.primary,
    },

    summaryCard: {
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 16,
      marginBottom: 18,

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

    summaryRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },

    summaryLabel: {
      flex: 1,
      fontSize: 15,
      color: colors.textSecondary,
      paddingRight: 12,
    },

    summaryValue: {
      fontSize: 17,
      fontWeight: "bold",
      color: colors.text,
    },

    listTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 12,
    },

    saleCard: {
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 18,
      marginBottom: 14,

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

    saleHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: 14,
    },

    saleTime: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
    },

    saleDate: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
    },

    paymentBadge: {
      overflow: "hidden",
      borderRadius: 8,
      backgroundColor: colors.badge,
      paddingHorizontal: 12,
      paddingVertical: 7,

      fontSize: 13,
      fontWeight: "bold",
      color: colors.text,
    },

    itemsContainer: {
      marginBottom: 6,
    },

    itemRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 10,
    },

    itemInfo: {
      flex: 1,
      paddingRight: 12,
    },

    itemText: {
      fontSize: 16,
      color: colors.text,
    },

    itemUnitPrice: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
    },

    itemSubtotal: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },

    divider: {
      height: 1,
      backgroundColor: colors.divider,
      marginVertical: 12,
    },

    totalRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    totalLabel: {
      fontSize: 16,
      color: colors.textSecondary,
      fontWeight: "600",
    },

    totalValue: {
      fontSize: 24,
      color: colors.text,
      fontWeight: "bold",
    },

    cashDetails: {
      marginTop: 12,
    },

    paymentDetail: {
      fontSize: 15,
      color: colors.textSecondary,
      marginTop: 4,
    },

    emptyText: {
      textAlign: "center",
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 20,
    },
  });
}
