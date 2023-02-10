
namespace TheGrailLordsOfBretonnia {

    type ThumbnailFilenameToBasicSet = {
        [thumbnailFile: string]: ArmourySystem.BasicSet
    }

    const ARMOURY_DATA: ThumbnailFilenameToBasicSet = {
        
            ["UI/Portraits/Portholes/admiralnelson/bret_lord_massif_1.png"] : {
                FaceId: "face_massif_lord_1",
                HelmetId: "hair_massif_lord1",
                ArmourId: "tabard_massif_lord2",
                WeaponId: "2handed_axe",
                ShieldId: "NONE"
            },
            ["UI/Portraits/Portholes/admiralnelson/bret_lord_massif_2.png"] : {
                FaceId: "face_massif_lord_2",
                HelmetId: "hair_massif_lord2",
                ArmourId: "tabard_massif_lord2",
                WeaponId: "2handed_axe",
                ShieldId: "NONE"
            },
            ["UI/Portraits/Portholes/admiralnelson/bret_lord_massif_3.png"] : {
                FaceId: "face_massif_lord_3",
                HelmetId: "hair_massif_lord3",
                ArmourId: "tabard_massif_lord3",
                WeaponId: "2handed_axe",
                ShieldId: "NONE"
            },
            ["UI/Portraits/Portholes/admiralnelson/bret_lord_massif_4.png"] : {
                FaceId: "face_massif_lord_4",
                HelmetId: "hair_massif_lord4",
                ArmourId: "tabard_massif_lord4",
                WeaponId: "basic_sword",
                ShieldId: "basic_shield"
            },
            ["UI/Portraits/Portholes/admiralnelson/bret_lord_massif_5.png"] : {
                FaceId: "face_massif_lord_8",
                HelmetId: "hair_massif_lord5",
                ArmourId: "tabard_massif_lord5",
                WeaponId: "basic_sword",
                ShieldId: "basic_shield"
            },
    }

    ArmourySystem.RegisterFaction(["wh_main_brt_bretonnia"])
    ArmourySystem.RegisterSubtypeAgent(["admiralnelson_bret_lord_massif_agent_key","admiralnelson_bret_lord_massif_sword_shield_agent_key"])
    for (const [fileName, basicSet] of Object.entries(ARMOURY_DATA)) {
        ArmourySystem.RegisterThumbnailFilenamesToAssociatedBasicSet(fileName, basicSet)
    }
    ArmourySystem.RegisterArmour([
        {
                anciliaryKey: "wh_dlc07_anc_armour_armour_of_the_midsummer_sun",
                subtypeAgentKey: "admiralnelson_bret_lord_massif_agent_key",
                assetId: "massif_wh_dlc07_anc_armour_armour_of_the_midsummer_sun"
            },{
                anciliaryKey: "wh_dlc07_anc_armour_cuirass_of_fortune",
                subtypeAgentKey: "admiralnelson_bret_lord_massif_agent_key",
                assetId: "massif_wh_dlc07_anc_armour_cuirass_of_fortune"
            },{
                anciliaryKey: "wh_dlc07_anc_armour_gilded_cuirass",
                subtypeAgentKey: "admiralnelson_bret_lord_massif_agent_key",
                assetId: "massif_wh_dlc07_anc_armour_gilded_cuirass"
            },{
                anciliaryKey: "wh_dlc07_anc_armour_the_grail_shield",
                subtypeAgentKey: "admiralnelson_bret_lord_massif_agent_key",
                assetId: "massif_wh_dlc07_anc_armour_the_grail_shield"
            },{
                anciliaryKey: "wh_main_anc_armour_armour_of_destiny",
                subtypeAgentKey: "admiralnelson_bret_lord_massif_agent_key",
                assetId: "massif_wh_main_anc_armour_armour_of_destiny"
            },{
                anciliaryKey: "wh_main_anc_armour_gamblers_armour",
                subtypeAgentKey: "admiralnelson_bret_lord_massif_agent_key",
                assetId: "naked_body"
            },{
                anciliaryKey: "wh_main_anc_armour_armour_of_silvered_steel",
                subtypeAgentKey: "admiralnelson_bret_lord_massif_agent_key",
                assetId: "massif_wh_main_anc_armour_armour_of_silvered_steel"
            },{
                anciliaryKey: "wh_main_anc_armour_glittering_scales",
                subtypeAgentKey: "admiralnelson_bret_lord_massif_agent_key",
                assetId: "massif_wh_main_anc_armour_glittering_scales"
            },{
                anciliaryKey: "wh_main_anc_armour_armour_of_fortune",
                subtypeAgentKey: "admiralnelson_bret_lord_massif_agent_key",
                assetId: "massif_wh_main_anc_armour_armour_of_fortune"
            },{
                anciliaryKey: "wh_dlc07_anc_armour_armour_of_the_midsummer_sun",
                subtypeAgentKey: "admiralnelson_bret_lord_massif_sword_shield_agent_key",
                assetId: "massif_wh_dlc07_anc_armour_armour_of_the_midsummer_sun"
            },{
                anciliaryKey: "wh_dlc07_anc_armour_cuirass_of_fortune",
                subtypeAgentKey: "admiralnelson_bret_lord_massif_sword_shield_agent_key",
                assetId: "massif_wh_dlc07_anc_armour_cuirass_of_fortune"
            },{
                anciliaryKey: "wh_dlc07_anc_armour_gilded_cuirass",
                subtypeAgentKey: "admiralnelson_bret_lord_massif_sword_shield_agent_key",
                assetId: "massif_wh_dlc07_anc_armour_gilded_cuirass"
            },{
                anciliaryKey: "wh_dlc07_anc_armour_the_grail_shield",
                subtypeAgentKey: "admiralnelson_bret_lord_massif_sword_shield_agent_key",
                assetId: "massif_wh_dlc07_anc_armour_the_grail_shield"
            },{
                anciliaryKey: "wh_main_anc_armour_armour_of_destiny",
                subtypeAgentKey: "admiralnelson_bret_lord_massif_sword_shield_agent_key",
                assetId: "massif_wh_main_anc_armour_armour_of_destiny"
            },{
                anciliaryKey: "wh_main_anc_armour_gamblers_armour",
                subtypeAgentKey: "admiralnelson_bret_lord_massif_sword_shield_agent_key",
                assetId: "naked_body"
            },{
                anciliaryKey: "wh_main_anc_armour_armour_of_silvered_steel",
                subtypeAgentKey: "admiralnelson_bret_lord_massif_sword_shield_agent_key",
                assetId: "massif_wh_main_anc_armour_armour_of_silvered_steel"
            },{
                anciliaryKey: "wh_main_anc_armour_glittering_scales",
                subtypeAgentKey: "admiralnelson_bret_lord_massif_sword_shield_agent_key",
                assetId: "massif_wh_main_anc_armour_glittering_scales"
            },{
                anciliaryKey: "wh_main_anc_armour_armour_of_fortune",
                subtypeAgentKey: "admiralnelson_bret_lord_massif_sword_shield_agent_key",
                assetId: "massif_wh_main_anc_armour_armour_of_fortune"
            },
    ])
    ArmourySystem.RegisterHelmet([
        {
                anciliaryKey: "admiralnelson_dragon_helmet_anciliary_key",
                subtypeAgentKey: "admiralnelson_bret_lord_massif_agent_key",
                assetId: "dragonhelm_helmet"
            },{
                anciliaryKey: "admiralnelson_dragon_helmet_anciliary_key",
                subtypeAgentKey: "admiralnelson_bret_lord_massif_sword_shield_agent_key",
                assetId: "dragonhelm_helmet"
            },
    ])
    ArmourySystem.RegisterWeapon([
        {
                anciliaryKey: "admiralnelson_bane_of_the_undead_axe_anciliary_key",
                subtypeAgentKey: "admiralnelson_bret_lord_massif_agent_key",
                assetId: "bane_of_the_undead_axe"
            },{
                anciliaryKey: "admiralnelson_thunderstrike_sword_anciliary_key",
                subtypeAgentKey: "admiralnelson_bret_lord_massif_sword_shield_agent_key",
                assetId: "thunderstrike_sword"
            },
    ])
    ArmourySystem.RegisterShield([
        {
                anciliaryKey: "admiralnelson_the_unbreakable_wall_anciliary_key",
                subtypeAgentKey: "admiralnelson_bret_lord_massif_sword_shield_agent_key",
                assetId: "the_unbreakable_wall_shield"
            },
    ])

    ArmourySystem.MakeThisItemIncompatibleWithAgent("admiralnelson_bret_lord_massif_agent_key", ["admiralnelson_the_unbreakable_wall_anciliary_key"])

    
}
