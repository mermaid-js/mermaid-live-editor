import db from '$/firebase/firebase.client';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  type DocumentData,
  type QueryDocumentSnapshot,
  type SnapshotOptions,
  type DocumentReference,
  type CollectionReference
} from 'firebase/firestore';

export class FirestoreService<T extends { id?: string }> {
  private readonly collectionName: string;
  private readonly converter: FirestoreDataConverter<T>;

  constructor(collectionName: string, converter: FirestoreDataConverter<T>) {
    this.collectionName = collectionName;
    this.converter = converter;
  }

  private getCollectionRef(): CollectionReference<T> {
    return collection(db, this.collectionName).withConverter(this.converter);
  }

  private getDocumentReference(id: string): DocumentReference<T> {
    return doc(db, this.collectionName, id).withConverter(this.converter);
  }

  private getSubCollectionRef(parentId: string, subCollectionName: string): CollectionReference<T> {
    return collection(db, this.collectionName, parentId, subCollectionName).withConverter(
      this.converter
    );
  }

  async getAll(): Promise<T[]> {
    const querySnapshot = await getDocs(this.getCollectionRef());
    return querySnapshot.docs.map((doc) => doc.data());
  }

  async getById(id: string): Promise<T | undefined> {
    const docReferenceerence = this.getDocumentReference(id);
    const docSnap = await getDoc(docReferenceerence);
    return docSnap.exists() ? docSnap.data() : undefined;
  }

  async create(item: Omit<T, 'id'>): Promise<T> {
    const docReferenceerence = await addDoc(this.getCollectionRef(), item as T);
    return { ...item, id: docReferenceerence.id } as T;
  }

  async update(id: string, item: Partial<T>): Promise<void> {
    const docReferenceerence = this.getDocumentReference(id);
    await updateDoc(docReferenceerence, item as DocumentData);
  }

  async delete(id: string): Promise<void> {
    const docReferenceerence = this.getDocumentReference(id);
    await deleteDoc(docReferenceerence);
  }

  async getSubDocument<U>(
    parentId: string,
    subCollectionName: string,
    subDocumentId: string
  ): Promise<U | undefined> {
    const docReference = doc(db, this.collectionName, parentId, subCollectionName, subDocumentId);
    const docSnap = await getDoc(docReference);
    return docSnap.exists() ? (docSnap.data() as U) : undefined;
  }

  async updateArrayField<U>(
    docId: string,
    fieldPath: string,
    operation: 'add' | 'remove' | 'update',
    item: U,
    identifierKey: keyof U = 'id' as keyof U
  ): Promise<void> {
    const docReference = this.getDocumentReference(docId);

    switch (operation) {
      case 'add': {
        await updateDoc(docReference, {
          [fieldPath]: arrayUnion(item)
        });
        break;
      }

      case 'remove': {
        await updateDoc(docReference, {
          [fieldPath]: arrayRemove(item)
        });
        break;
      }

      case 'update': {
        const identifierValue = item[identifierKey];
        await updateDoc(docReference, {
          [fieldPath]: arrayRemove({ [identifierKey]: identifierValue })
        });
        await updateDoc(docReference, {
          [fieldPath]: arrayUnion(item)
        });
        break;
      }
    }
  }

  async getArrayField<U>(docId: string, fieldPath: keyof T | string): Promise<U[] | undefined> {
    const document = await this.getById(docId);

    if (!document) {
      return undefined;
    }

    // Vérification type-safe de l'existence du champ
    if (fieldPath in document) {
      const fieldValue = document[fieldPath as keyof T];
      return Array.isArray(fieldValue) ? (fieldValue as U[]) : undefined;
    }

    // Pour les chemins imbriqués (ex: 'analysisResultModel.design')
    if (typeof fieldPath === 'string' && fieldPath.includes('.')) {
      const parts = fieldPath.split('.');
      let current: unknown = document; // Utilisation de unknown au lieu de any

      for (const part of parts) {
        if (!current || typeof current !== 'object') {
          return undefined;
        }

        // Vérification type-safe de l'accès à la propriété
        if (!(part in current)) {
          return undefined;
        }

        // Utilisation d'un type guard pour accéder à la propriété
        current = (current as Record<string, unknown>)[part];
      }

      return Array.isArray(current) ? (current as U[]) : undefined;
    }

    return undefined;
  }
}

interface FirestoreDataConverter<T> {
  toFirestore(item: T): DocumentData;
  fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): T;
}

export function createConverter<T extends { id?: string }>(
  defaultValues: Partial<T>
): FirestoreDataConverter<T> {
  return {
    toFirestore: (item: T) => {
      const { ...data } = item;
      return data;
    },
    fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions): T => {
      const data = snapshot.data(options);
      return { ...defaultValues, ...data, id: snapshot.id } as T;
    }
  };
}
