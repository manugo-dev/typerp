export interface CharacterCreate {
  licenseId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}

export interface Character extends CharacterCreate {
  id: number;
  createdAt: Date;
}
