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
            
            new Lord({
                factionKey: "wh_main_brt_bretonnia",
                agentKey: "admiralnelson_bret_lord_massif_sword_shield_agent_key",
                regionKey: faction.FactionLeader?.CurrentRegionKey,
                lordCreatedCallback: (lord) => {
                    // alert(`thumbnail path is : ${lord.ThumbnailFileName.toLowerCase()}`)
                    // const fac = GetFactionByKey("wh_main_brt_bretonnia")
                    // if(fac == null) return

                    // let char = ""
                    // for (const c of fac.Characters) {
                    //     char = `${char}, ${c.LocalisedFullName}`
                    // }
                    // alert(char, () => {
                    //     lord.ChangeModelAppearance(`admiralnelson_brt_generic_lord_massif_sword_shield_art_key_1`)
                    // })
                } 
            })

            for (let i = 0; i < 5; i++) {
                cm.spawn_character_to_pool("wh_main_brt_bretonnia", "", "", "", "", 18, true, "general", `admiralnelson_bret_lord_massif_agent_key`, false, "")                
                cm.spawn_character_to_pool("wh_main_brt_bretonnia", "", "", "", "", 18, true, "general", `admiralnelson_bret_lord_massif_sword_shield_agent_key`, false, "")                
                cm.spawn_character_to_pool("wh_main_brt_bretonnia", "", "", "", "", 18, true, "general", `admiralnelson_bret_lord_2handed_agent_key`, false, "")             

            }

            

        }

        constructor() {
            OnCampaignStart( () => this.Init() )
        }
    }
    
    new YourEntryPoint()
}