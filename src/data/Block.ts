/* eslint-disable license-header/header */
export class Block {
  public type: number;
  public metadata: unknown;
  public biomeId: number;
  public stateId?: number;

  public constructor(type: number, biomeId: number, metadata: unknown, stateId?: number) {
    this.type = type;
    this.biomeId = biomeId;
    this.metadata = metadata;
    this.stateId = stateId;
  }
}
