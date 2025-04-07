import { getFirestoreDatabase } from '$/firebase/firebase.client';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
  type SnapshotOptions
} from 'firebase/firestore';

export class FirestoreService<T extends { id?: string }> {
  private readonly collectionName: string;
  private readonly converter: FirestoreDataConverter<T>;

  constructor(collectionName: string, converter: FirestoreDataConverter<T>) {
    this.collectionName = collectionName;
    this.converter = converter;
  }

  private getCollectionRef() {
    return collection(getFirestoreDatabase(), this.collectionName).withConverter(this.converter);
  }

  private getdocReference(id: string) {
    return doc(getFirestoreDatabase(), this.collectionName, id).withConverter(this.converter);
  }

  async getAll(): Promise<T[]> {
    const querySnapshot = await getDocs(this.getCollectionRef());
    return querySnapshot.docs.map((doc) => doc.data());
  }

  async getById(id: string): Promise<T | undefined> {
    const docReference = this.getdocReference(id);
    const docSnap = await getDoc(docReference);
    return docSnap.exists() ? docSnap.data() : undefined;
  }

  async create(item: Omit<T, 'id'>): Promise<T> {
    const docReference = await addDoc(this.getCollectionRef(), item as T);
    return { ...item, id: docReference.id } as T;
  }

  async update(id: string, item: Partial<T>): Promise<void> {
    const docReference = this.getdocReference(id);
    await updateDoc(docReference, item as DocumentData);
  }

  async delete(id: string): Promise<void> {
    const docReference = this.getdocReference(id);
    await deleteDoc(docReference);
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
      const { id, ...data } = item;
      return data;
    },
    fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions): T => {
      const data = snapshot.data(options);
      return { ...defaultValues, ...data, id: snapshot.id } as T;
    }
  };
}
