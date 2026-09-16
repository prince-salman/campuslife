class UmkmModel {
  final String id;
  final String name;
  final String category;
  final String priceTag;
  final double? rating;
  final String? promoBadge;
  final String? bannerText;
  final int cardColorHex;

  const UmkmModel({
    required this.id,
    required this.name,
    required this.category,
    required this.priceTag,
    this.rating,
    this.promoBadge,
    this.bannerText,
    required this.cardColorHex,
  });
}
