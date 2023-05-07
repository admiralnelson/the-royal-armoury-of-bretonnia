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

        const AnciliaryArmourKeys: AnciliaryKeyToAssetId[] = []
        const AnciliaryHelmetKeys: AnciliaryKeyToAssetId[] = []
        const AnciliaryWeaponKeys: AnciliaryKeyToAssetId[] = []
        const AnciliaryShieldKeys: AnciliaryKeyToAssetId[] = []
        const AllowAncillaryOverlap: Set<string> = new Set<string>()

        let CharacterPanel: IUIComponent | null = null

        let IsRunning = false

        export const DoNotRemoveItemsWithKeywords: Set<string> = new Set<string>()

        type ArmourySystemSaveData = {
            Version: number
            CqiToAssociatedBasicSet: CqiToBasicSet[]
        }

        const ThumbnailFilenamesToAssociatedBasicSet: Map<string, BasicSet> = new Map<string, BasicSet>()
        const AgentSubtypeAnciliaryIncompatibilities: Map<string, Set<string>> = new Map<string, Set<string>>()
        const ArmouredCharacters: Set<ArmouredCharacter> = new Set<ArmouredCharacter>()
        const ConflictingAnciliaries: Map<string, Set<string>> = new Map<string, Set<string>>()

        let ArmourySystemData: ArmourySystemSaveData | null = null

        const LoadingTime = PerformanceCounterBegin()

        export function ChangeThumbnail(character: Character, thumbnailPath: string) {
            const armouredCharacter = FindArmouredCharacter(character)
            if(armouredCharacter == null) {
                console.warn(`cannot cast ${character.LocalisedFullName} to armouredCharacter`)
                return false
            }
            const basicSet = ThumbnailFilenamesToAssociatedBasicSet.get(thumbnailPath)
            if(basicSet == null) {
                console.warn(`thumbnail is not registed ${thumbnailPath}`)
                return false
            }
            
            CqiReplaceArmourySystemData(armouredCharacter, basicSet)
            ArmourySystem.ApplyTheArmours()
            return true
        } 

        export function CastToArmouredCharacter(character: Character): IArmouredCharacter | undefined {
            return FindArmouredCharacter(character)
        }

        export function RegisterFaction(factionKeys: string[]) {
            for (const factionKey of factionKeys) {
                WhitelistedFactions.add(factionKey)
            }
        }

        export function GetWhitelistedFactions(): string[] {
            return Array.from(WhitelistedFactions)
        }

        export function IsThisAgentSubtypeRegistered(agentKey: string): boolean {
            return WhitelistedSubAgentKeys.has(agentKey)
        }
                
        export function RegisterSubtypeAgent(agentKeys: string[]) {
            for (const agentKey of agentKeys) {
                WhitelistedSubAgentKeys.add(agentKey)
                if(!AgentSubtypeAnciliaryIncompatibilities.has(agentKey)) AgentSubtypeAnciliaryIncompatibilities.set(agentKey, new Set<string>())   
            }
        }

        export function RegisterThumbnailFilenamesToAssociatedBasicSet(thumbnail: string, basicSet: BasicSet) {
            if(basicSet.ShieldId == "") basicSet.ShieldId = "NONE"
            ThumbnailFilenamesToAssociatedBasicSet.set(thumbnail.toLowerCase(), basicSet)
            logger.Log(`Registering ${thumbnail} with value of ${JSON.stringify(basicSet)}`)
        }

        export function AllowOverlapAnciliaryKeys(ancillaryKeys: string[]) {
            for (const ancillary of ancillaryKeys) {
                AllowAncillaryOverlap.add(ancillary)
            }
        }

        export function RegisterArmour(armourAncilliaryKeys: AnciliaryKeyToAssetId[]) {
            const ancilaryArmourKeys = AnciliaryArmourKeys      
            for (const iterator of armourAncilliaryKeys) {
                const foundExisting = ancilaryArmourKeys.findIndex( 
                    armourKey => armourKey.anciliaryKey == iterator.anciliaryKey && 
                                 armourKey.assetId == iterator.assetId &&
                                 armourKey.subtypeAgentKey == iterator.subtypeAgentKey) >= 0
                if(!foundExisting) AnciliaryArmourKeys.push(iterator)
            }
        }

        export function RegisterWeapon(weaponAncilliaryKeys: AnciliaryKeyToAssetId[]) {
            const ancilaryWeaponKeys = AnciliaryWeaponKeys     
            for (const iterator of weaponAncilliaryKeys) {
                const foundExisting = ancilaryWeaponKeys.findIndex( 
                    weaponKey => weaponKey.anciliaryKey == iterator.anciliaryKey && 
                                 weaponKey.assetId == iterator.assetId &&
                                 weaponKey.subtypeAgentKey == iterator.subtypeAgentKey) >= 0
                if(!foundExisting) AnciliaryWeaponKeys.push(iterator)
            }
        }

        export function RegisterHelmet(helmetAncilliaryKeys: AnciliaryKeyToAssetId[]) {
            const ancilaryHelmetKeys = AnciliaryHelmetKeys          
            for (const iterator of helmetAncilliaryKeys) {
                const foundExisting = ancilaryHelmetKeys.findIndex( 
                    helmetKey => helmetKey.anciliaryKey == iterator.anciliaryKey && 
                                 helmetKey.assetId == iterator.assetId &&
                                 helmetKey.subtypeAgentKey == iterator.subtypeAgentKey) >= 0
                if(!foundExisting) AnciliaryHelmetKeys.push(iterator)
            }
        }

        export function RegisterShield(shieldAncilliaryKeys: AnciliaryKeyToAssetId[]) {
            const ancilaryShieldKeys = AnciliaryShieldKeys
            for (const iterator of shieldAncilliaryKeys) {
                const foundExisting = ancilaryShieldKeys.findIndex( 
                    shieldKey => shieldKey.anciliaryKey == iterator.anciliaryKey && 
                                 shieldKey.assetId == iterator.assetId &&
                                 shieldKey.subtypeAgentKey == iterator.subtypeAgentKey) >= 0
                if(!foundExisting) AnciliaryShieldKeys.push(iterator)
            }
        }

        export function MakeThisItemIncompatibleWithAgent(subagentKey: string, anciliaries: string[]) {            
            let compat = AgentSubtypeAnciliaryIncompatibilities.get(subagentKey)
            if(compat == null) {
               compat = new Set<string>()
               AgentSubtypeAnciliaryIncompatibilities.set(subagentKey, compat) 
            }
            for (const anciliary of anciliaries) {
                compat.add(anciliary)
            }             
           
        }

        export function MakeThisItemIncompatibleWithItems(anciliaryKey: string, anciliaries: string[]) {
            let compat = ConflictingAnciliaries.get(anciliaryKey)
            if(compat == null) {
               compat = new Set<string>()
               ConflictingAnciliaries.set(anciliaryKey, compat) 
            }
            for (const anciliary of anciliaries) {
                compat.add(anciliary)
            }
        }
        
        export function Initialise() {
            if(IsRunning) return

            IsRunning = true
            Begin()
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

        function CqiReplaceArmourySystemData(character: ArmouredCharacter, basicSet: BasicSet) {
            if(ArmourySystemData == null) {
                logger.LogError(`AddCqiToArmourySystemData: ArmourySystemData was null`)
                throw(`CqiReplaceArmourySystemData failed`)
            }

            const index = ArmourySystemData.CqiToAssociatedBasicSet.findIndex( armouredCqi => armouredCqi.Cqi == character.CqiNo)
            if(index >= 0) {
                ArmourySystemData.CqiToAssociatedBasicSet[index].BasicSet = basicSet
                SaveData()
            } else {
                logger.LogError(`armoured character does not exist ${character.LocalisedFullName} cqi ${character.CqiNo}`)
            }
        }

        function RemoveCqiFromArmourySystemData(cqis: number[]) {
            if(ArmourySystemData == null) {
                logger.LogError(`AddCqiToArmourySystemData: ArmourySystemData was null`)
                throw(`AddCqiToArmourySystemData failed`)
            }

            for (const cqiNr of cqis) {
                const index = ArmourySystemData.CqiToAssociatedBasicSet.findIndex( armouredCqi => armouredCqi.Cqi == cqiNr)
                if(index >= 0) {
                    ArmourySystemData.CqiToAssociatedBasicSet.splice(index, 1)
                }
            }

            SaveData()
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
            setTimeout(() => {
                const validate = Validate()
                if(!validate[0]) {
                    alert(`Some of the armoury data is not initalised! Reason: ${validate[1]}`)
                } 
            }, 300)

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
                CharacterPanel = CommonUserInterface.Find(
                    CommonUserInterface.GetRootUI(),
                    `character_details_panel`,
                )

                OnTurnEnds()
                OnAnciliaryGainedByCharacter()
                logger.LogWarn(`PERFORMANCE REPORT: loading took ${PerformanceCounterEnd() - LoadingTime} ms`)
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
            logger.LogWarn(`Starting new game.`)
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

            ArmouredCharacters.clear()

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
                logger.LogWarn(`Data loaded: ${data}`)
            } catch (error) {
                logger.LogError(`failed to load saved Armoury Data. Save game is toasted reason: ${error}`)
                return false
            }
            return true
        }

        function SaveData() {
            const data = JSON.stringify(ArmourySystemData)
            localStorage.setItem(SAVE_DATA_SLOT, data)
            logger.LogWarn(`Data Saved! ${data}`)
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
                } else {
                    const charactersInFaction = faction?.Characters.filter( character => WhitelistedSubAgentKeys.has(character.SubtypeKey) )
                    for (const character of charactersInFaction) {
                        characters.push(character)
                    }
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

        export function ApplyTheArmours() {
            //const time = PerformanceCounterBegin()
            const invalidCharacters = []
            for (const armouredCharacter of ArmouredCharacters) {
                if(armouredCharacter.IsCharacterPhysicallyVisibleOnMap) {
                    armouredCharacter.WearArmour()
                } else {
                    invalidCharacters.push(armouredCharacter.AssignedCqi)
                }
            }
            RemoveCqiFromArmourySystemData(invalidCharacters)
            //logger.Log(`invalid CQIs: ${JSON.stringify(invalidCharacters)}`)            
            //logger.Log(`ApplyTheArmours OK. Operation took ${PerformanceCounterEnd() - time} ms`)
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
            core.add_listener(
                `on campaign ancillary click`,
                `ComponentLClickUp`,
                context => context.string == "ancillary_entry",
                () => setTimeout( () => {
                    CloseCharacterScreen()
                    ApplyTheArmours()
                    OpenCharacterScreen()
                }, 100),
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
                    if(!IsCharacterScreenBeingDisplayed()) ApplyTheArmours()
                },
                true
            )
            logger.Log(`OnAnciliaryGainedByCharacter OK`)
        }

        function FindArmouredCharacterByCqi(cqi: number): ArmouredCharacter | undefined {
            if(ArmourySystemData == null) {
                logger.LogError(`FindArmouredCharacterByCqi: ArmourySystemData is null and not initialised`)
                throw(`FindArmouredCharacterByCqi failed`)
            }
            return Array.from(ArmouredCharacters).find(armouredCharacter => armouredCharacter.CqiNo == cqi)            
        }

        function FindArmouredCharacter(character: Character): ArmouredCharacter | undefined {
            if(ArmourySystemData == null) {
                logger.LogError(`FindArmouredCharacter: ArmourySystemData is null and not initialised`)
                throw(`FindArmouredCharacter failed`)
            }
            return Array.from(ArmouredCharacters).find(armouredCharacter => armouredCharacter.CqiNo == character.CqiNo)            
        }

        function GetArmourId(agentSubtype: string, anciliariesKeys: string[]): string | null {
            const knownArmours = AnciliaryArmourKeys
            const armourId = knownArmours.find( knownArmour => anciliariesKeys.includes(knownArmour.anciliaryKey) && knownArmour.subtypeAgentKey == agentSubtype )
            
            if(!armourId) return null
            return armourId.assetId
        }

        function GetHelmetId(agentSubtype: string, anciliariesKeys: string[]): string | null {
            const knownHelmets = AnciliaryHelmetKeys
            const helmetId = knownHelmets.find( knownHelmet => anciliariesKeys.includes(knownHelmet.anciliaryKey) && knownHelmet.subtypeAgentKey == agentSubtype )
            
            if(!helmetId) return null
            return helmetId.assetId
        }

        function GetWeaponId(agentSubtype: string, anciliariesKeys: string[]): string | null {
            const knownWeapons = AnciliaryWeaponKeys
            const weaponId = knownWeapons.find( knownWeapon => anciliariesKeys.includes(knownWeapon.anciliaryKey) && knownWeapon.subtypeAgentKey == agentSubtype )
            
            if(!weaponId) return null
            return weaponId.assetId
        }

        function GetShieldId(agentSubtype: string, anciliariesKeys: string[]): string | null {
            const knownShields = AnciliaryShieldKeys
            const shieldId = knownShields.find( knownShield => anciliariesKeys.includes(knownShield.anciliaryKey) && knownShield.subtypeAgentKey == agentSubtype )
            
            if(!shieldId) return null
            return shieldId.assetId
        }

        function IsItemincompatibleWithAgent(agentKey: string, anciliaryKey: string): boolean {
            const anciliaries = AgentSubtypeAnciliaryIncompatibilities.get(agentKey)
            if(anciliaries == null) return false
            const ancillariesArray = Array.from(anciliaries)
            return ancillariesArray.includes(anciliaryKey)
        }

        function IsCharacterScreenBeingDisplayed(): boolean {
            if(CharacterPanel == null) return false
            return CharacterPanel.VisibleFromRoot()
        }

        export interface IArmouredCharacter {
            ChangeBasicAppearance(thumbnailFileName: string): boolean
            GetVariantMeshId(): void
        }

        function CloseCharacterScreen() {
            const checkButton = CommonUserInterface.Find(
                CommonUserInterface.GetRootUI(),
                "character_details_panel",
                "character_context_parent",
                "button_bottom_holder",
                "button_ok"
            )

            if(checkButton == null) return
            checkButton.SimulateLClick()
        }

        function OpenCharacterScreen() {
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
        }

        class ArmouredCharacter extends Character implements IArmouredCharacter {

            private DoNotRemoveItemsWithKeywords = ["mount", "warhorse", "hippogrif", "pegasus", "khaine"]
            private currentVariantMeshId = ""
            private Cqi = -1
            
            constructor(character: Character) {
                super({
                    characterObject: character.GetInternalInterface()
                })
                this.DoNotRemoveItemsWithKeywords.concat(Object.values(DoNotRemoveItemsWithKeywords))
                this.Cqi = this.CqiNo
            }

            get IsCharacterPhysicallyVisibleOnMap(): boolean {
                return this.IsValid()
            }

            /**
             * this CQI always exists even when the character becomes invalid
             */
            get AssignedCqi(): number {
                return this.Cqi
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

            private UnequipConflictingItems() {
                const anciliaries = this.AnciliaryKeys
                const incompatible = []
                for (const anciliary of anciliaries) {
                    const conflictedAnciliary = ConflictingAnciliaries.get(anciliary)
                    if(conflictedAnciliary != null) {
                        const whatAnciliariesAreNotCompat = Array.from(conflictedAnciliary.values())
                        const intersections = whatAnciliariesAreNotCompat.filter( incompatibleAncies => anciliaries.includes(incompatibleAncies) )
                        if(intersections.length > 0) {
                            incompatible.push(anciliary)
                            this.RemoveAnciliary(anciliary, true, true)
                        }
                    }
                }
                return incompatible
            }
            
            private UnequipDoubleItems() {
                const anciliaries = this.AnciliaryKeys

                const armourAnciliaries = AnciliaryArmourKeys.filter( 
                    anciliaryArmour => anciliaries.includes(anciliaryArmour.anciliaryKey) && 
                                       anciliaryArmour.subtypeAgentKey == this.SubtypeKey &&
                                       !AllowAncillaryOverlap.has(anciliaryArmour.anciliaryKey) )
                if(armourAnciliaries.length > 1) {
                    const firstItem = armourAnciliaries[0]
                    for (const anciliary of armourAnciliaries) {
                        if(anciliary != firstItem) {
                            this.RemoveAnciliary(anciliary.anciliaryKey, true, true)
                        }
                    }
                }

                const weaponAnciliaries = AnciliaryWeaponKeys.filter( 
                    anciliaryWeapon => anciliaries.includes(anciliaryWeapon.anciliaryKey) && 
                                       anciliaryWeapon.subtypeAgentKey == this.SubtypeKey &&
                                       !AllowAncillaryOverlap.has(anciliaryWeapon.anciliaryKey) )
                if(weaponAnciliaries.length > 1) {
                    const firstItem = weaponAnciliaries[0]
                    for (const anciliary of weaponAnciliaries) {
                        if(anciliary != firstItem) {
                            this.RemoveAnciliary(anciliary.anciliaryKey, true, true)
                        }
                    }
                }

                const helmetAncilliaries = AnciliaryHelmetKeys.filter( 
                    ancillaryHelmet => anciliaries.includes(ancillaryHelmet.anciliaryKey) && 
                                       ancillaryHelmet.subtypeAgentKey == this.SubtypeKey &&
                                       !AllowAncillaryOverlap.has(ancillaryHelmet.anciliaryKey) )
                if(helmetAncilliaries.length > 1) {
                    const firstItem = helmetAncilliaries[0]
                    for (const anciliary of helmetAncilliaries) {
                        if(anciliary != firstItem) {
                            this.RemoveAnciliary(anciliary.anciliaryKey, true, true)
                        }
                    }
                }

                const shieldAncilliaryKeys = AnciliaryShieldKeys.filter( 
                    ancillaryShield => anciliaries.includes(ancillaryShield.anciliaryKey) && 
                                       ancillaryShield.subtypeAgentKey == this.SubtypeKey &&
                                       !AllowAncillaryOverlap.has(ancillaryShield.anciliaryKey) )
                if(shieldAncilliaryKeys.length > 1) {
                    const firstItem = shieldAncilliaryKeys[0]
                    for (const anciliary of shieldAncilliaryKeys) {
                        if(anciliary != firstItem) {
                            this.RemoveAnciliary(anciliary.anciliaryKey, true, true)                            
                        }
                    }
                }

            }

            private UnequipIncompatibleItems() {
                const incompatibleItems = []
                const anciliaries = this.AnciliaryKeys
                for (const anciliary of anciliaries) {
                    if(IsItemincompatibleWithAgent(this.SubtypeKey, anciliary)) 
                        incompatibleItems.push(anciliary)
                }

                for (const incompatibleItem of incompatibleItems) {
                    this.RemoveAnciliary(incompatibleItem, true, true)
                }
                return incompatibleItems
            }

            ChangeBasicAppearance(thumbnailFileName: string): boolean {
                const thumbnail = ThumbnailFilenamesToAssociatedBasicSet.get(thumbnailFileName)
                if(thumbnail == undefined) {
                    logger.LogWarn(`ChangeBasicAppearance ${thumbnailFileName} not found!`)
                    return false
                }
                CqiReplaceArmourySystemData(this, thumbnail)

                this.WearArmour()
                return true
            }
    
            WearArmour() {        
                logger.LogWarn(`Applying armour for: ${this.LocalisedFullName}`)
                this.UnequipDoubleItems()        
                const incompatibleItems = this.UnequipIncompatibleItems()
                const conflictingItems = this.UnequipConflictingItems()
                setTimeout(() => {
                    if(incompatibleItems.length > 0 && 
                        this.Faction.IsHumanTurn && 
                        IsCharacterScreenBeingDisplayed()) {
                        const sentence = `This item is not compatible with this character: ${incompatibleItems[0]}`
                        console.warn(`This item is not compatible with this character: ${incompatibleItems[0]}`)
                        alert(sentence)
                    }
                }, 300)
                setTimeout(() => {
                    if(conflictingItems.length > 0 && 
                       this.Faction.IsHumanTurn && 
                       IsCharacterScreenBeingDisplayed()) {
                       const sentence  = `This item ${conflictingItems[0]} is conflicting with some of your equipped items`
                       console.warn(`This item ${conflictingItems[0]} with some of your equipped items`)
                       alert(sentence)
                    }
                }, 300)
                const variantMeshId = this.GetVariantMeshId()
                //the magic goes here:
                if(variantMeshId != this.currentVariantMeshId) {
                    this.currentVariantMeshId = variantMeshId
                    this.ChangeModelAppearance(variantMeshId)
                    logger.LogWarn(`this character ${this.CqiNo} ${this.LocalisedFullName} will use ${variantMeshId}`)
                    //logger.LogWarn(`this character anciliaries ${JSON.stringify(this.AnciliaryKeys)}`)
                }
            }
    
            GetVariantMeshId(): string {
                const FaceId = this.FaceId 
                const helmetId = GetHelmetId(this.SubtypeKey, this.AnciliaryKeys) ?? this.BasicHelmetId
                const armourId = GetArmourId(this.SubtypeKey, this.AnciliaryKeys) ?? this.BasicArmourId
                const weaponId = GetWeaponId(this.SubtypeKey, this.AnciliaryKeys) ?? this.BasicWeaponId
                const shieldId = GetShieldId(this.SubtypeKey, this.AnciliaryKeys) ?? this.BasicShieldId
                
                return `A.${FaceId}.${helmetId}.${armourId}.${weaponId}.${shieldId}`
            }
    
            CanUseShield(): boolean {
                return false
            }
        }

    }

   
    
}