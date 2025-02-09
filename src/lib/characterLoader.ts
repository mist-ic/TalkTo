import { z } from 'zod';
import type { Character } from '@/types/character';
import { characterSchema } from '@/types/character';

interface CharacterCache {
  [key: string]: Character;
}

export class CharacterLoader {
  private static instance: CharacterLoader;
  private cache: CharacterCache = {};
  private characterList: string[] = [
    'gandhi',
    'bhagat',
    'laxmibai',
    'tesla',
    'newton',
    'einstein',
    'shivaji',
    'genghis',
    'napolean'
  ];

  private categories = {
    freedomFighters: ['gandhi', 'bhagat', 'laxmibai'],
    scientists: ['einstein', 'tesla', 'newton'],
    militaryLeaders: ['shivaji', 'genghis', 'napolean']
  };

  private constructor() {}

  public static getInstance(): CharacterLoader {
    if (!CharacterLoader.instance) {
      CharacterLoader.instance = new CharacterLoader();
    }
    return CharacterLoader.instance;
  }

  public async loadCharacter(id: string): Promise<Character> {
    try {
      // Check cache first
      if (this.cache[id]) {
        return this.cache[id];
      }

      // Load character data
      const response = await fetch(`/characters/${id}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load character: ${id}`);
      }

      const data = await response.json();
      
      // Validate character data
      const character = characterSchema.parse(data);
      
      // Cache the result
      this.cache[id] = character;
      
      return character;
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error(`Character validation error for ${id}:`, error.errors);
        throw new Error(`Invalid character data for ${id}`);
      }
      throw error;
    }
  }

  public async loadAllCharacters(): Promise<Character[]> {
    try {
      const characters = await Promise.all(
        this.characterList.map(id => this.loadCharacter(id))
      );
      return characters;
    } catch (error) {
      console.error('Failed to load all characters:', error);
      throw error;
    }
  }

  public async loadCategory(category: keyof typeof this.categories): Promise<Character[]> {
    try {
      const characters = await Promise.all(
        this.categories[category].map(id => this.loadCharacter(id))
      );
      return characters;
    } catch (error) {
      console.error(`Failed to load category ${category}:`, error);
      throw error;
    }
  }

  public clearCache(): void {
    this.cache = {};
  }

  public getCachedCharacter(id: string): Character | undefined {
    return this.cache[id];
  }

  public getCategories(): string[] {
    return Object.keys(this.categories);
  }

  public getCharactersByCategory(category: keyof typeof this.categories): string[] {
    return this.categories[category];
  }
} 