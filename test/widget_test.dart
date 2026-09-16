import 'package:flutter_test/flutter_test.dart';
import 'package:campus_life/main.dart';

void main() {
  testWidgets('App renders smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const CampusLifeApp());
    expect(find.text('Hi, RICE'), findsOneWidget);
  });
}
