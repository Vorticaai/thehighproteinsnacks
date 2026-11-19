# Verification run 2026-11-19

1 products checked. Values change only for products marked **verified**.

| Product | Status | USDA record | Open Food Facts | Changes | Photo | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| chomps-turkey-jerky-meat-stick | needs-review | [2554461](https://fdc.nal.usda.gov/food-details/2554461/nutrients) ORIGINAL TURKEY STICKS, ORIGINAL TURKEY | [0850015892295](https://world.openfoodfacts.org/product/0850015892295) | none | added | Pinned by a person after review. USDA and Open Food Facts disagree (calories: 60 vs 80). Reviewer: the auto-search's top candidate (fdcId 2653535) is a 14g mini stick, clearly wrong for a 12g-protein product. This candidate (2554461, description 'ORIGINAL TURKEY STICKS', brandName CHOMPS despite an odd brandOwner field) has no 'mini' in its name and scored the same 50% as the mini one, so wasn't auto-picked. Multiple major retailers (Kroger, Target, H-E-B, Giant Food, Lowes Foods - all independently) consistently list the regular 1.15oz/32g Chomps Original Turkey Stick at 12g protein, 0g sugar, 80 calories, matching our existing catalogue value exactly. Pinning this candidate so the pipeline's own USDA fetch can confirm or reject it directly - not hand-transcribing the retailer numbers themselves. |
