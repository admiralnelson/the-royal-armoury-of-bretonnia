namespace TheGrailLordsOfBretonnia {

    export namespace ArmourySystem {

        export type BasicSet = {
            ArmourId: string
            FaceId: string
            HelmetId: string
            WeaponId: string
            ShieldId: string        
        }

        export type AnciliaryKeyToAssetId = {
            anciliaryKey: string
            subtypeAgentKey: string
            assetId: string
        }

        type CqiToBasicSet = {
            Cqi: number
            BasicSet: BasicSet
        }


        const VERSION = 1
        const SAVE_DATA_SLOT = "ADMIRALNELSON_ARMOURY_SYSTEM_DATA"

        const logger = new Logger(`Admiralnelson ArmourySystem`)

        const WhitelistedFactions: Set<string> = new Set<string>()
        const WhitelistedSubAgentKeys: Set<string> = new Set<string>()

        const AnciliaryArmourKeys: Set<AnciliaryKeyToAssetId> = new Set<AnciliaryKeyToAssetId>()
        const AnciliaryHelmetKeys: Set<AnciliaryKeyToAssetId> = new Set<AnciliaryKeyToAssetId>()
        const AnciliaryWeaponKeys: Set<AnciliaryKeyToAssetId> = new Set<AnciliaryKeyToAssetId>()
        const AnciliaryShieldKeys: Set<AnciliaryKeyToAssetId> = new Set<AnciliaryKeyToAssetId>()

        let IsRunning = false

        export const DoNotRemoveItemsWithKeywords: Set<string> = new Set<string>()

        type ArmourySystemSaveData = {
            Version: number
            CqiToAssociatedBasicSet: CqiToBasicSet[]
        }

        const ThumbnailFilenamesToAssociatedBasicSet: Map<string, BasicSet> = new Map<string, BasicSet>()
        const AnciliaryIncompatibilities: Map<string, Set<string>> = new Map<string, Set<string>>()
        const ArmouredCharacters: Set<ArmouredCharacter> = new Set<ArmouredCharacter>()

        let ArmourySystemData: ArmourySystemSaveData | null = null

        export function RegisterFaction(factionKeys: string[]) {
            for (const factionKey of factionKeys) {
                WhitelistedFactions.add(factionKey)
            }
        }
                
        export function RegisterSubtypeAgent(agentKeys: string[]) {
            for (const agentKey of agentKeys) {
                WhitelistedSubAgentKeys.add(agentKey)
                if(!AnciliaryIncompatibilities.has(agentKey)) AnciliaryIncompatibilities.set(agentKey, new Set<string>())   
            }
        }

        export function RegisterThumbnailFilenamesToAssociatedBasicSet(thumbnail: string, basicSet: BasicSet) {
            if(basicSet.ShieldId == "") basicSet.ShieldId = "NONE"
            ThumbnailFilenamesToAssociatedBasicSet.set(thumbnail.toLowerCase(), basicSet)
            logger.Log(`Registering ${thumbnail} with value of ${JSON.stringify(basicSet)}`)
        }

        export function RegisterArmour(armourAncilliaryKeys: AnciliaryKeyToAssetId[]) {
            for (const iterator of armourAncilliaryKeys) {
                AnciliaryArmourKeys.add(iterator)
            }
        }

        export function RegisterWeapon(weaponAncilliaryKeys: AnciliaryKeyToAssetId[]) {
            for (const iterator of weaponAncilliaryKeys) {
                AnciliaryWeaponKeys.add(iterator)
            }
        }

        export function RegisterHelmet(helmetAncilliaryKeys: AnciliaryKeyToAssetId[]) {
            for (const iterator of helmetAncilliaryKeys) {
                AnciliaryHelmetKeys.add(iterator)
            }
        }

        export function RegisterShield(shieldAncilliaryKeys: AnciliaryKeyToAssetId[]) {
            for (const iterator of shieldAncilliaryKeys) {
                AnciliaryShieldKeys.add(iterator)
            }
        }

        export function IsAnciliaryExists(subagentKey: string, anciliaryKey: string): boolean {
            const armour = Array.from(AnciliaryArmourKeys).findIndex( anciliary => anciliary.subtypeAgentKey == subagentKey && anciliary.anciliaryKey == anciliaryKey  ) >= 0
            const helmet = Array.from(AnciliaryHelmetKeys).findIndex( anciliary => anciliary.subtypeAgentKey == subagentKey && anciliary.anciliaryKey == anciliaryKey  ) >= 0
            const weapon = Array.from(AnciliaryWeaponKeys).findIndex( anciliary => anciliary.subtypeAgentKey == subagentKey && anciliary.anciliaryKey == anciliaryKey  ) >= 0
            const shield = Array.from(AnciliaryShieldKeys).findIndex( anciliary => anciliary.subtypeAgentKey == subagentKey && anciliary.anciliaryKey == anciliaryKey  ) >= 0
            return armour || helmet || weapon || shield
        }

        export function MakeThisItemIncompatibleWithAgent(subagentKey: string, anciliaries: string[]) {            
            const compat = AnciliaryIncompatibilities.get(subagentKey)
            if(compat == null) return
            for (const anciliary of anciliaries) {
                if(IsAnciliaryExists(subagentKey, anciliary)) compat.add(anciliary)
                else logger.LogWarn(`anciliary is not registered in the system: ${anciliary}`)
            }             
           
        }
        
        export function Initialise() {
            if(IsRunning) return

            IsRunning = true
            setTimeout(() => {
                Begin()
            }, 100);
        }

        function GetBasicSetFromArmourySystemData(character: Character): BasicSet | null {
            if(ArmourySystemData == null) {
                logger.LogError(`GetBasicSetFromArmourySystemData: ArmourySystemData was null`)
                throw(`GetBasicSetFromArmourySystemData failed`)
            }

            const index = ArmourySystemData.CqiToAssociatedBasicSet.findIndex( armouredCqi => armouredCqi.Cqi == character.CqiNo)
            if(index >= 0) return ArmourySystemData.CqiToAssociatedBasicSet[index].BasicSet
            return null
        }

        function AddCqiToArmourySystemData(character: ArmouredCharacter, basicSet: BasicSet) {
            if(ArmourySystemData == null) {
                logger.LogError(`AddCqiToArmourySystemData: ArmourySystemData was null`)
                throw(`AddCqiToArmourySystemData failed`)
            }

            const index = ArmourySystemData.CqiToAssociatedBasicSet.findIndex( armouredCqi => armouredCqi.Cqi == character.CqiNo)
            if(index >= 0) {
                ArmourySystemData.CqiToAssociatedBasicSet[index].BasicSet = basicSet
            } else {
                ArmourySystemData.CqiToAssociatedBasicSet.push({
                    Cqi: character.CqiNo,
                    BasicSet: basicSet
                })
            }
        }

        function Begin() {
            const validate = Validate()
            if(!validate[0]) {
                alert(`Failed to initialise the armoury system!\nSome of the armoury data is not initalised! Reason: ${validate[1]}`)
                return false
            }

            InitialiseForTheFirstTime()
            if(!LoadData()) {
                alert(`Failed to initialise the armoury system!\nYour campaign is probably toased. Please see the console log!`)
                return false
            }

            try {
                SetupOnCharacterSpawnApplyArmourSystem()
                InitialiseArmourySystemForCharacters()
                DeserialiseArmouredCharacters()
                ApplyTheArmours()
                SetupOnCharacterChangeItem()

                OnTurnEnds()
                OnAnciliaryGainedByCharacter()
                return true   
            } catch (error) {
                alert(`Failed to initialise the armoury system!\nYour campaign is probably toased. Please see the console log!\nReason: ${error}`)
                logger.LogError(error as string)
            }

            return false
        }

        function Validate(): [isOK: boolean, whatError: string]  {
            if(ThumbnailFilenamesToAssociatedBasicSet.size == 0) {
                return [false, "ThumbnailFilenamesToAssociatedBasicSet is empty"]
            }

            if(WhitelistedFactions.size == 0) {
                return [false, "WhitelistedFactions is empty"]
            }

            if(WhitelistedSubAgentKeys.size == 0) {
                return [false, "WhitelistedSubAgentKeys is empty"]
            }

            for (const [key, value] of ThumbnailFilenamesToAssociatedBasicSet) {
                if(key == "") return [false, "empty key"]
                if(value.ArmourId == "") return [false, `ArmourId is empty for ${key}`]
                if(value.FaceId == "") return [false, `FaceId is empty for ${key}`]
                if(value.HelmetId == "") return [false, `HelmetId is empty for ${key}`]
                if(value.ShieldId == "") return [false, `ShieldId is empty for ${key}`]
                if(value.WeaponId == "") return [false, `WeaponId is empty for ${key}`]
            }

            return [true, "all good"]
        }

        function InitialiseForTheFirstTime(): boolean {
            if(LoadData()) return false

            ArmourySystemData = {
                Version: VERSION,
                CqiToAssociatedBasicSet: [],
            }
            SaveData()
            return true
        }

        function InitialiseArmourySystemForCharacters() {
            if(ArmourySystemData == null) {
                logger.LogError(`InitialiseArmourySystemForCharacter: ArmourySystemData was null!`)
                throw(`InitialiseArmourySystemForCharacter failed`)
            }

            const characters = FindAllCharacters().filter( character => GetBasicSetFromArmourySystemData(character) == null )

            for (const character of characters) {
                const newArmouredCharacter = new ArmouredCharacter(character)
                AddCqiToArmourySystemData(newArmouredCharacter, GetCharacterBasicFaceAndArmourSet(newArmouredCharacter))
            }
            SaveData()
            logger.Log(`InitialiseArmourySystemForCharacters OK`)
        }

        function DeserialiseArmouredCharacters() {
            if(ArmourySystemData == null) {
                logger.LogError(`DeserialisedArmouredCharacter: ArmourySystemData was null!`)
                throw(`DeserialisedArmouredCharacter failed`)
            }

            for (const cqiAndBasicSet of ArmourySystemData.CqiToAssociatedBasicSet) {
                const character = FindCharacter(cqiAndBasicSet.Cqi)
                if(character == null) {
                    logger.LogError(`Found invalid CQI number ${cqiAndBasicSet.Cqi}`)
                } else {
                    ArmouredCharacters.add(new ArmouredCharacter(character))
                }
            }
            logger.Log(`DeserialiseArmouredCharacters OK`)
        }

        function LoadData(): boolean {
            try {
                const data = localStorage.getItem(SAVE_DATA_SLOT) as string  
                if(data == null) return false

                ArmourySystemData = JSON.parse(data)

            } catch (error) {
                logger.LogError(`failed to load saved Armoury Data. Save game is toasted reason: ${error}`)
                return false
            }
            return true
        }

        function SaveData() {
            localStorage.setItem(SAVE_DATA_SLOT, JSON.stringify(ArmourySystemData))
        }

        function FindAllCharacters(): Character[] {
            const factions = []
            for (const facitonKey of WhitelistedFactions) {
                factions.push(GetFactionByKey(facitonKey))
            }

            const characters = []
            for (const faction of factions) {
                if(faction == null) {
                    logger.LogError(`FindAllCharacters: found null faction`)
                    throw(`FindAllCharacters failed`)
                }
                const charactersInFaction = faction?.Characters.filter( character => WhitelistedSubAgentKeys.has(character.SubtypeKey) )
                for (const character of charactersInFaction) {
                    characters.push(character)
                }
            }

            return characters
        }

        function GetCharacterBasicFaceAndArmourSet(character: ArmouredCharacter): BasicSet {
            if(ArmourySystemData == null) {
                logger.LogError(`GetCharacterBasicFaceAndArmourSet: ArmourySystemData is null! The module has not been initialised!`)
                throw(`GetCharacterBasicFaceAndArmourSet failed`)
            }
            if(!WhitelistedSubAgentKeys.has(character.SubtypeKey)) {
                logger.LogError(`GetCharacterBasicFaceAndArmourSet: This character ${character.SubtypeKey} ${character.LocalisedFullName} is not allowed to use the armory system`)
                throw(`GetCharacterBasicFaceAndArmourSet failed`)
            }

            //this where all the magic happens
            const thumbnailFileName = character.ThumbnailFileName.toLowerCase()

            let basicSet = GetBasicSetFromArmourySystemData(character)
            if(basicSet == null) {
                const originalBasicSet = ThumbnailFilenamesToAssociatedBasicSet.get(thumbnailFileName)

                if(originalBasicSet == null) {
                    logger.LogError(`GetCharacterBasicFaceAndArmourSet: this characther does not have basic set assigned!`)
                    throw(`GetCharacterBasicFaceAndArmourSet failed`)
                }

                basicSet = originalBasicSet
                return basicSet
            }

            return basicSet
        }

        function ApplyTheArmours() {
            for (const armouredCharacter of ArmouredCharacters) {
                armouredCharacter.WearArmour()
            }
            logger.Log(`ApplyTheArmours OK`)
        }

        function SetupOnCharacterSpawnApplyArmourSystem() {
            core.add_listener(
                `on character spawn`,
                "CharacterRecruited",
                context => {
                    if(context.character == null) return false
                    const character = WrapICharacterObjectToCharacter(context.character())

                    return WhitelistedFactions.has(character.FactionKey) && 
                           WhitelistedSubAgentKeys.has(character.SubtypeKey)                    
                },
                context => {
                    if(context.character == null) return
                    const character = new ArmouredCharacter(WrapICharacterObjectToCharacter(context.character()))
                    AddCqiToArmourySystemData(character, GetCharacterBasicFaceAndArmourSet(character))
                    ArmouredCharacters.add(character)
                    character.WearArmour()
                    SaveData()
                    logger.Log(`Character ${character.LocalisedFullName} ${character.CqiNo} just spawned and we applied armoury system for him`)                    
                },
                true
            )
            logger.Log(`SetupOnCharacterSpawnApplyArmourSystem OK`)
        }

        function SetupOnCharacterChangeItem() {
            //when changin armour
            core.add_listener(
                `on item equip by the player`,
                `ComponentLClickUp`,
                true,
                context => {
                    const selectedButton = context.string
                    if(selectedButton == null) return
                    if(!selectedButton.startsWith(`CcoCampaignAncillary`) &&
                       !selectedButton.startsWith(`ancillary_entry`)) return
                    
                    setTimeout(() => {
                        ApplyTheArmours()  
                    }, 10)

                    //refresh the character screen
                    setTimeout(() => {
                        const checkButton = CommonUserInterface.Find(
                            CommonUserInterface.GetRootUI(),
                            "character_details_panel",
                            "character_context_parent",
                            "button_bottom_holder",
                            "button_ok"    
                        )

                        if(checkButton == null) return
                        checkButton.SimulateLClick()
                    }, 15)

                    setTimeout(() => {
                        const openCharacterWindow = CommonUserInterface.Find(
                            CommonUserInterface.GetRootUI(),
                            "hud_campaign",
                            "info_panel_holder",
                            "primary_info_panel_holder",
                            "info_button_list",
                            "button_general"
                        )

                        if(openCharacterWindow == null) return
                        openCharacterWindow.SimulateLClick()
                    }, 20)
                },
                true
            )
            
            logger.Log(`SetupOnCharacterChangeItem ok`)
        }

        function OnTurnEnds() {
            core.add_listener(
                `on turn end to update armour state`,
                `FactionTurnEnd`,
                context => {
                    if(context.faction == null) return false
                    const faction = context.faction().name()
                    return WhitelistedFactions.has(faction)
                },
                () => {
                    ApplyTheArmours()
                },
                true
            )
            logger.Log(`OnTurnEnds OK`)
        }

        function OnAnciliaryGainedByCharacter() {
            core.add_listener(
                `on character gained anciliary to update armour`,
                `CharacterAncillaryGained`,
                true,
                context => {
                    if(context.character == null) return
                    const character = FindArmouredCharacter(WrapICharacterObjectToCharacter(context.character()))
                    if(character == null) return

                    character.WearArmour()
                },
                true
            )
            logger.Log(`OnAnciliaryGainedByCharacter OK`)
        }

        function FindArmouredCharacterByCqi(cqi: number): ArmouredCharacter | undefined {
            if(ArmourySystemData == null) {
                logger.LogError(`CastToArmouredCharacter: ArmourySystemData is null and not initialised`)
                throw(`CastToArmouredCharacter failed`)
            }
            return Array.from(ArmouredCharacters).find(armouredCharacter => armouredCharacter.CqiNo == cqi)            
        }

        function FindArmouredCharacter(character: Character): ArmouredCharacter | undefined {
            if(ArmourySystemData == null) {
                logger.LogError(`CastToArmouredCharacter: ArmourySystemData is null and not initialised`)
                throw(`CastToArmouredCharacter failed`)
            }
            return Array.from(ArmouredCharacters).find(armouredCharacter => armouredCharacter.CqiNo == character.CqiNo)            
        }

        function GetArmourId(agentSubtype: string, anciliariesKeys: string[]): string | null {
            const knownArmours = Array.from(AnciliaryArmourKeys)
            const armourId = knownArmours.find( knownArmour => anciliariesKeys.includes(knownArmour.anciliaryKey) && knownArmour.subtypeAgentKey == agentSubtype )
            
            if(!armourId) return null
            return armourId.assetId
        }

        function GetHelmetId(agentSubtype: string, anciliariesKeys: string[]): string | null {
            const knownHelmets = Array.from(AnciliaryHelmetKeys)
            const helmetId = knownHelmets.find( knownHelmet => anciliariesKeys.includes(knownHelmet.anciliaryKey) && knownHelmet.subtypeAgentKey == agentSubtype )
            
            if(!helmetId) return null
            return helmetId.assetId
        }

        function GetWeaponId(agentSubtype: string, anciliariesKeys: string[]): string | null {
            const knownWeapons = Array.from(AnciliaryWeaponKeys)
            const weaponId = knownWeapons.find( knownWeapon => anciliariesKeys.includes(knownWeapon.anciliaryKey) && knownWeapon.subtypeAgentKey == agentSubtype )
            
            if(!weaponId) return null
            return weaponId.assetId
        }

        function GetShieldId(agentSubtype: string, anciliariesKeys: string[]): string | null {
            const knownShields = Array.from(AnciliaryShieldKeys)
            const shieldId = knownShields.find( knownShield => anciliariesKeys.includes(knownShield.anciliaryKey) && knownShield.subtypeAgentKey == agentSubtype )
            
            if(!shieldId) return null
            return shieldId.assetId
        }

        function IsItemincompatibleWithAgent(agentKey: string, anciliaryKey: string): boolean {
            const anciliaries = AnciliaryIncompatibilities.get(agentKey)
            if(anciliaries == null) return false
            const ancillariesArray = Array.from(anciliaries)
            return ancillariesArray.includes(anciliaryKey)
        }

        class ArmouredCharacter extends Character {

            private DoNotRemoveItemsWithKeywords = ["mount", "warhorse", "hippogrif", "pegasus"]

            constructor(character: Character) {
                super({
                    characterObject: character.GetInternalInterface()
                })
                this.DoNotRemoveItemsWithKeywords.concat(Object.values(DoNotRemoveItemsWithKeywords))
            }
    
            get FaceId(): string {
                if(ArmourySystemData == null) {
                    logger.LogError(`FaceId: ArmourySystemData is null and not initialised`)
                    throw(`getter FaceId failed`)
                }
    
                const basicArmour = GetBasicSetFromArmourySystemData(this)
                if(basicArmour == null) {
                    logger.LogError(`FaceId: Armoury system is not applied to this character ${this.CqiNo} ${this.LocalisedFullName}`)
                    throw(`getter FaceId failed`)
                }
                return basicArmour.FaceId
            }
    
            get BasicArmourId(): string {
                if(ArmourySystemData == null) {
                    logger.LogError(`BasicArmourId: ArmourySystemData is null and not initialised`)
                    throw(`getter BasicArmourId failed`)
                }
    
                const basicArmour = GetBasicSetFromArmourySystemData(this)
                if(basicArmour == null) {
                    logger.LogError(`BasicArmourId: Armoury system is not applied to this character ${this.CqiNo} ${this.LocalisedFullName}`)
                    throw(`getter BasicArmourId failed`)
                }
                return basicArmour.ArmourId
            }
    
            get BasicHelmetId(): string {
                if(ArmourySystemData == null) {
                    logger.LogError(`BasicHelmetId: ArmourySystemData is null and not initialised`)
                    throw(`getter BasicHelmetId failed`)
                }
    
                const basicArmour = GetBasicSetFromArmourySystemData(this)
                if(basicArmour == null) {
                    logger.LogError(`BasicHelmetId: Armoury system is not applied to this character ${this.CqiNo} ${this.LocalisedFullName}`)
                    throw(`getter BasicHelmetId failed`)
                }
                return basicArmour.HelmetId
            }
    
            get BasicShieldId(): string {
                if(ArmourySystemData == null) {
                    logger.LogError(`BasicShieldId: ArmourySystemData is null and not initialised`)
                    throw(`getter FaceId failed`)
                }
    
                const basicArmour = GetBasicSetFromArmourySystemData(this)
                if(basicArmour == null) {
                    logger.LogError(`BasicShieldId: Armoury system is not applied to this character ${this.CqiNo} ${this.LocalisedFullName}`)
                    throw(`getter BasicShieldId failed`)
                }
                return basicArmour.ShieldId
            }
    
            get BasicWeaponId(): string {
                if(ArmourySystemData == null) {
                    logger.LogError(`BasicWeaponId: ArmourySystemData is null and not initialised`)
                    throw(`getter FaceId failed`)
                }
    
                const basicArmour = GetBasicSetFromArmourySystemData(this)
                if(basicArmour == null) {
                    logger.LogError(`BasicShieldId: Armoury system is not applied to this character ${this.CqiNo} ${this.LocalisedFullName}`)
                    throw(`getter BasicShieldId failed`)
                }
                return basicArmour.WeaponId
            }
            
            UnequipDoubleItems() {
                const anciliaries = this.AnciliaryKeys
                const helmetAncilliaries = Array.from(AnciliaryHelmetKeys).filter( ancillaryHelmet => anciliaries.includes(ancillaryHelmet.anciliaryKey) )
                if(helmetAncilliaries.length <= 1) {
                    for (const anciliary of helmetAncilliaries) {
                        this.RemoveAnciliary(anciliary.anciliaryKey, true, true)
                    }
                }

                const shieldAncilliaryKeys = Array.from(AnciliaryShieldKeys).filter( ancillaryShield => anciliaries.includes(ancillaryShield.anciliaryKey) )
                if(shieldAncilliaryKeys.length <= 1) {
                    for (const anciliary of shieldAncilliaryKeys) {
                        this.RemoveAnciliary(anciliary.anciliaryKey, true, true)
                    }
                }
            }

            UnequipIncompatibleItems() {
                const incompatibleItems = this.AnciliaryKeys.filter( anciliary => 
                    IsItemincompatibleWithAgent(this.SubtypeKey, anciliary) && 
                    !this.DoNotRemoveItemsWithKeywords.some( keyword => anciliary.includes(keyword) ) 
                )
                for (const incompatibleItem of incompatibleItems) {
                    this.RemoveAnciliary(incompatibleItem, true, true)
                }
                return incompatibleItems
            }
    
            WearArmour() {        
                this.UnequipDoubleItems()        
                const incompatibleItems = this.UnequipIncompatibleItems()
                if(incompatibleItems.length > 0 && this.Faction.IsHuman) {
                    const sentence = `This item is not compatible with this character: ${incompatibleItems[0]}`
                    alert(sentence)
                }
                const variantMeshId = this.GetVariantMeshId()
                logger.LogWarn(`this character ${this.CqiNo} ${this.LocalisedFullName} will use ${variantMeshId}`)
                logger.LogWarn(`this character anciliaries ${JSON.stringify(this.AnciliaryKeys)}`)
                //the magic goes here:
                this.ChangeModelAppearance(variantMeshId)
            }
    
            GetVariantMeshId(): string {
                const FaceId = this.FaceId 
                const helmetId = GetHelmetId(this.SubtypeKey, this.AnciliaryKeys) ?? this.BasicHelmetId
                const armourId = GetArmourId(this.SubtypeKey, this.AnciliaryKeys) ?? this.BasicArmourId
                const weaponId = GetWeaponId(this.SubtypeKey, this.AnciliaryKeys) ?? this.BasicWeaponId
                const shieldId = GetShieldId(this.SubtypeKey, this.AnciliaryKeys) ?? this.BasicShieldId
                
                return `ArmourySystem__${FaceId}__${helmetId}__${armourId}__${weaponId}__${shieldId}`
            }
    
            CanUseShield(): boolean {
                return false
            }
        }

    }

   
    
}