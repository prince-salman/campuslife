import 'package:flutter/material.dart';
import '../core/constants/app_colors.dart';
import '../models/schedule_model.dart';
import '../models/wallet_model.dart';
import '../models/banner_model.dart';
import '../models/umkm_model.dart';
import '../widgets/header_widget.dart';
import '../widgets/first_lesson_card.dart';
import '../widgets/finance_card.dart';
import '../widgets/promo_banner_slider.dart';
import '../widgets/search_bar_widget.dart';
import '../widgets/category_tabs.dart';
import '../widgets/umkm_grid_card.dart';
import '../models/transaction_model.dart';
import '../services/wallet_service.dart';
import '../widgets/add_transaction_dialog.dart';

class HomeScreen extends StatefulWidget {
  final VoidCallback? onNavigateToFinance;

  const HomeScreen({super.key, this.onNavigateToFinance});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String _selectedCategory = 'F&B';

  @override
  void initState() {
    super.initState();
    WalletService.instance.addListener(_onWalletUpdated);
  }

  @override
  void dispose() {
    WalletService.instance.removeListener(_onWalletUpdated);
    super.dispose();
  }

  void _onWalletUpdated() {
    if (mounted) {
      setState(() {});
    }
  }

  final ScheduleItem _todaySchedule = const ScheduleItem(
    title: 'Informatics',
    timeRange: '08:00 WIB – 10:00 WIB',
    lecturer: 'Mr. John Liebert',
    duration: '2 Hours',
  );

  WalletModel get _walletData => WalletModel(
    balance: WalletService.instance.balance,
    monthlySpent: WalletService.instance.currentMonthSpent,
    currentMonth: WalletService.instance.selectedMonth,
  );

  final List<PromoBannerModel> _banners = const [
    PromoBannerModel(
      id: 'b1',
      title: 'Laundry\nExpress',
      subtitle: 'Menerima Laundry :',
      services: ['Baju', 'Sepatu', 'Selimut', 'Alas Lantai', 'Sprei', 'Jaket'],
      contact: '+123-456-7890',
    ),
    PromoBannerModel(
      id: 'b2',
      title: 'Print &\nFotocopy',
      subtitle: 'Buka 24 Jam :',
      services: ['Skripsi', 'Jilid Hardcover', 'Poster A3', 'Stiker'],
      contact: '+123-888-9999',
    ),
  ];

  final List<String> _categories = const [
    'Laundry',
    'F&B',
    'Homestay',
    'Fotocopy',
    'Holiday',
  ];

  final List<UmkmModel> _umkmList = const [
    UmkmModel(
      id: '1',
      name: 'Kokoes Bites',
      category: 'F&B',
      priceTag: '15K',
      rating: 5.0,
      bannerText: 'Kokoes Dessert',
      cardColorHex: 0xFF2C2D30,
    ),
    UmkmModel(
      id: '2',
      name: 'Bakso Sapi Enak',
      category: 'F&B',
      priceTag: '10K',
      bannerText: 'BAKSO FAVORIT',
      cardColorHex: 0xFF8B2500,
    ),
    UmkmModel(
      id: '3',
      name: 'Ayam Geprek Kampus',
      category: 'F&B',
      priceTag: '12K',
      bannerText: 'AYAM GEPREK',
      cardColorHex: 0xFF8B1A1A,
    ),
    UmkmModel(
      id: '4',
      name: 'Paket Hemat Makan',
      category: 'F&B',
      priceTag: '50%',
      bannerText: 'MAKAN HEMAT',
      cardColorHex: 0xFF9E2A2B,
    ),
    UmkmModel(
      id: '5',
      name: 'Dimsum Mentai',
      category: 'F&B',
      priceTag: '18K',
      bannerText: 'DIMSUM MENTAI',
      cardColorHex: 0xFF3D2314,
    ),
    UmkmModel(
      id: '6',
      name: 'Guriuk Chicken',
      category: 'F&B',
      priceTag: '5K',
      bannerText: 'GURIUK!',
      cardColorHex: 0xFF335C67,
    ),
    UmkmModel(
      id: '7',
      name: 'Non Coffee Area',
      category: 'F&B',
      priceTag: '10K',
      bannerText: 'NON COFFEE IS READY',
      cardColorHex: 0xFF1D3557,
    ),
    UmkmModel(
      id: '8',
      name: 'Ngecas Energi',
      category: 'F&B',
      priceTag: '8K',
      bannerText: 'NGECAS ENERGI',
      cardColorHex: 0xFF6B2D5C,
    ),
    UmkmModel(
      id: '9',
      name: 'Crispy Box',
      category: 'F&B',
      priceTag: '14K',
      bannerText: 'CRISPY BOX',
      cardColorHex: 0xFF7F4F24,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const HeaderWidget(userName: 'RICE'),
              const SizedBox(height: 16),
              FirstLessonCard(
                schedule: _todaySchedule,
                onTapDetail: () {},
              ),
              const SizedBox(height: 14),
              FinanceCard(
                wallet: _walletData,
                onIncomeTap: () {
                  AddTransactionDialog.show(
                    context,
                    type: TransactionType.income,
                    onSaved: () => setState(() {}),
                  );
                },
                onSpentTap: () {
                  AddTransactionDialog.show(
                    context,
                    type: TransactionType.spent,
                    onSaved: () => setState(() {}),
                  );
                },
                onHistoryTap: () {
                  widget.onNavigateToFinance?.call();
                },
              ),
              const SizedBox(height: 18),
              PromoBannerSlider(banners: _banners),
              const SizedBox(height: 16),
              SearchBarWidget(
                onChanged: (val) {},
              ),
              const SizedBox(height: 14),
              CategoryTabs(
                categories: _categories,
                selectedCategory: _selectedCategory,
                onSelectCategory: (cat) {
                  setState(() {
                    _selectedCategory = cat;
                  });
                },
              ),
              const SizedBox(height: 14),
              _buildResponsiveGrid(),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildResponsiveGrid() {
    return LayoutBuilder(
      builder: (context, constraints) {
        int crossAxisCount = 3;
        if (constraints.maxWidth > 600) {
          crossAxisCount = 4;
        }
        if (constraints.maxWidth > 900) {
          crossAxisCount = 6;
        }

        return GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: _umkmList.length,
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: crossAxisCount,
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
            childAspectRatio: 0.92,
          ),
          itemBuilder: (context, index) {
            return UmkmGridCard(
              item: _umkmList[index],
              onTap: () {},
            );
          },
        );
      },
    );
  }
}
