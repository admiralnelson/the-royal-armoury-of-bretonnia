namespace TheGrailLordsOfBretonnia {

    export const VERSION = 1

    export class YourEntryPoint {

        private Init(): void {
            console.log("Hello world, I'm compiled from Typescript project!")
            ArmourySystem.Initialise()

            const faction = GetFactionByKey("wh_main_brt_bretonnia")
            if(!faction) return

            const anciliariesTest = [
                `wh_main_anc_armour_glittering_scales`,
                `wh_dlc07_anc_armour_armour_of_the_midsummer_sun`,
                `wh_dlc07_anc_armour_cuirass_of_fortune`,
                `wh_main_anc_armour_armour_of_fortune`,
                `wh_dlc07_anc_armour_gilded_cuirass`,
                `wh_dlc07_anc_armour_the_grail_shield`,
                `wh_main_anc_armour_the_lions_shield`,
                `wh_main_anc_armour_armour_of_destiny`,
                `wh_main_anc_armour_armour_of_silvered_steel`,
                `wh_main_anc_armour_gamblers_armour`,

                `wh_dlc07_anc_armour_armour_of_the_midsummer_sun_cape`,
                `wh_dlc07_anc_armour_cuirass_of_fortune_cape`,
                `wh_dlc07_anc_armour_gilded_cuirass_cape_1`,
                `wh_dlc07_anc_armour_gilded_cuirass_cape_2`,
                `wh_main_anc_armour_armour_of_destiny_cape_1`,
                `wh_main_anc_armour_armour_of_destiny_cape_2`,
                `admiralnelson_armour_1_armour_anciliary_key`,
                `admiralnelson_armour_4_armour_anciliary_key`,
                `admiralnelson_armour_8_armour_anciliary_key`,
                
                `admiralnelson_bascinet_closed_crest_pegasus_helmet_anciliary_key`,
                `admiralnelson_gilded_sallet_crest_helmet_anciliary_key`,
                `admiralnelson_gilded_bascinet_helmet_anciliary_key`,
                `admiralnelson_gilded_sallet_lordly_padded_helmet_anciliary_key`,
                `admiralnelson_feathered_with_crest_antler_lady_helmet_anciliary_key`,
                `admiralnelson_feathered_closed_with_crest_antler_pegasus_helmet_anciliary_key`,
                `admiralnelson_great_helmet_helmet_anciliary_key`,

                `admiralnelson_the_unbreakable_wall_shield_anciliary_key`,
                `admiralnelson_norman_cross_shield_ancillary_key`,
                `admiralnelson_norman_reinforced_cross_shield_ancillary_key`,

                `wh_dlc03_anc_weapon_the_brass_cleaver`,
                `wh_main_anc_weapon_warrior_bane`,
                `wh2_main_anc_weapon_executioners_axe`,

                `wh_main_anc_weapon_berserker_sword`,
                `wh_main_anc_weapon_biting_blade`,
                `wh_main_anc_weapon_giant_blade`,
                `wh_main_anc_weapon_ogre_blade`,
                `wh_main_anc_weapon_fencers_blades`,
                `wh_main_anc_weapon_obsidian_blade`,
                `wh_main_anc_weapon_gold_sigil_sword`,
                `wh_main_anc_weapon_relic_sword`,

                `wh_main_anc_weapon_shrieking_blade`,
                `wh_main_anc_weapon_sword_of_anti-heroes`,
                `wh_main_anc_weapon_sword_of_battle`,
                `wh_main_anc_weapon_sword_of_bloodshed`,
                `wh_main_anc_weapon_sword_of_might`,
                `wh_main_anc_weapon_sword_of_strife`,
                `wh_main_anc_weapon_sword_of_striking`,
                `wh_main_anc_weapon_sword_of_swift_slaying`

            ]

            for (const item of anciliariesTest) {
                faction.AddAnciliary(item, true)
            }

            const BretonnianFactionsKeys = [
                "wh_main_brt_bretonnia",
                "wh_main_brt_carcassonne", 
                "wh_main_brt_bordeleaux", 
                "wh2_dlc14_brt_chevaliers_de_lyonesse", 
                "wh2_main_brt_knights_of_origo", 
                "wh2_main_brt_knights_of_the_flame", 
                "wh2_main_brt_thegans_crusaders", 
                "wh3_dlc20_brt_march_of_couronne", 
                "wh3_main_brt_aquitaine", 
                "wh_main_brt_artois", 
                "wh_main_brt_bastonne", 
           ]
        
           ArmourySystem.RegisterFaction(BretonnianFactionsKeys)


        }

        constructor() {
            OnCampaignStart( () => this.Init() )
        }
    }
    
    new YourEntryPoint()
}