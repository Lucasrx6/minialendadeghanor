declare module "@3d-dice/dice-box" {
  interface DiceBoxConfig {
    assetPath: string;
    theme?: string;
    offscreen?: boolean;
    gravity?: number;
    mass?: number;
    friction?: number;
    restitution?: number;
    angularDamping?: number;
    linearDamping?: number;
    spinForce?: number;
    throwForce?: number;
    startingHeight?: number;
    scale?: number;
    id?: string;
    [key: string]: unknown;
  }

  interface DieResult {
    sides: number;
    value: number;
    [key: string]: unknown;
  }

  class DiceBox {
    constructor(selector: string, config: DiceBoxConfig);
    init(): Promise<void>;
    roll(notation: string): void;
    add(notation: string): void;
    clear(): void;
    onRollComplete: ((results: DieResult[]) => void) | null;
    onThemeConfigLoaded: ((themeData: Record<string, unknown>) => void) | null;
    updateConfig(config: Partial<DiceBoxConfig>): void;
  }

  export default DiceBox;
}
