import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:campus_life/main.dart';

void main() {
  testWidgets('CampusLife Full App Flow Verification', (WidgetTester tester) async {
    await tester.pumpWidget(const CampusLifeApp());
    await tester.pumpAndSettle();

    // 1. Verify Home Screen loaded
    expect(find.text('Hi, RICE'), findsOneWidget);
    expect(find.text('Informatics'), findsOneWidget);

    // 2. Navigate to Jadwal (Schedule) Screen
    final scheduleTab = find.byIcon(Icons.calendar_today);
    expect(scheduleTab, findsOneWidget);
    await tester.tap(scheduleTab);
    await tester.pumpAndSettle();

    // Verify Schedule elements
    expect(find.text('June, 2026'), findsOneWidget);
    expect(find.text('Computer Network'), findsOneWidget);
    expect(find.text('Discrete Mathematics'), findsOneWidget);
    expect(find.text('B103'), findsOneWidget);
    expect(find.text('B209'), findsOneWidget);

    // Tap on Friday 15
    final friDay = find.text('15');
    if (friDay.evaluate().isNotEmpty) {
      await tester.tap(friDay);
      await tester.pumpAndSettle();
      expect(find.text('Artificial Intelligence'), findsOneWidget);
    }

    // 3. Navigate to Keuangan (Finance / Money Management) Screen
    final financeTab = find.byIcon(Icons.account_balance_wallet_outlined);
    expect(financeTab, findsOneWidget);
    await tester.tap(financeTab);
    await tester.pumpAndSettle();

    // Verify Finance Screen elements
    expect(find.text('Money_Management'), findsOneWidget);
    expect(find.text('Agustus'), findsWidgets);
    expect(find.text('Latest Transaction'), findsOneWidget);
    expect(find.text('Makan siang'), findsOneWidget);
    expect(find.text('Gojek'), findsOneWidget);
    expect(find.text('Fotocopy Berkas'), findsOneWidget);
    expect(find.text('Lightstick Babymonster'), findsOneWidget);

    // Test toggle visibility
    final eyeIcon = find.byIcon(Icons.visibility);
    if (eyeIcon.evaluate().isNotEmpty) {
      await tester.tap(eyeIcon.first);
      await tester.pumpAndSettle();
    }

    // Test tab switch to Income (segment toggle is the second 'Income' widget)
    final incomeTabs = find.text('Income');
    if (incomeTabs.evaluate().length > 1) {
      await tester.tap(incomeTabs.at(1));
      await tester.pumpAndSettle();
      expect(find.text('Uang Bulanan Ortu'), findsOneWidget);
    }

    // 4. Navigate to UMKM Screen
    final umkmTab = find.byIcon(Icons.storefront_outlined);
    expect(umkmTab, findsOneWidget);
    await tester.tap(umkmTab);
    await tester.pumpAndSettle();
  });
}