import { createClient } from '@supabase/supabase-js';
import { 
  auth as firebaseAuth, 
  db as firestoreDb,
  getCachedDoc,
  setCachedDoc,
  invalidateDocCache,
  getCachedQuery,
  setCachedQuery
} from './firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  sendPasswordResetEmail
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  getDoc
} from "firebase/firestore";

// The original Supabase anon key and project url
const supabaseUrl = 'https://kqhjubuhuwofhgdvosnk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxaGp1YnVodXdvZmhnZHZvc25rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2OTEyMTcsImV4cCI6MjA5OTI2NzIxN30.ML14yDvi6aPSprv21T_cmzcIyaUo6tfHTZ8Cr1C0BbY';

const realSupabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * FEATURE TOGGLE: Set to false to use Firebase Auth and Firestore Database as requested.
 * When set to true, the application switches back to Supabase.
 */
export const USE_SUPABASE = false;

// Helper to translate profiles from Firestore representation to Supabase layout expected by pages
function mapProfileToSupabase(profile: any) {
  if (!profile) return null;
  return {
    ...profile,
    id: profile.uid || profile.id,
    user_id: profile.uid || profile.user_id,
    IdNumber: profile.PlayerId || profile.IdNumber,
    is_public: profile.is_profile_public !== undefined ? profile.is_profile_public : profile.is_public,
    wallet_credits: profile.wallet_amount !== undefined ? profile.wallet_amount : profile.wallet_credits,
    IsIdentityVerified: profile.IsIdentityVerified || false,
    parents_email: profile.parents_email || '',
    cryptic_token: profile.cryptic_token || '',
    full_name: profile.full_name || '',
    bio: profile.bio || '',
    email: profile.email || ''
  };
}

// Chainable query builder mirroring the Supabase client syntax for Firestore
class FirestoreQueryBuilder {
  private tableName: string;
  private filters: any[] = [];
  private ilikeFilters: { field: string, pattern: string }[] = [];
  private orderField: string | null = null;
  private orderAscending: boolean = true;
  private limitCount: number | null = null;
  private isSingle: boolean = false;
  private insertData: any = null;
  private updateData: any = null;
  private isDelete: boolean = false;
  private orFilters: string[] = [];

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(columns?: string) {
    return this;
  }

  eq(field: string, value: any) {
    let finalField = field;
    if (this.tableName === 'profiles') {
      if (field === 'user_id' || field === 'id') finalField = 'uid';
      if (field === 'IdNumber') finalField = 'PlayerId';
      if (field === 'is_public') finalField = 'is_profile_public';
      if (field === 'wallet_credits') finalField = 'wallet_amount';
    }
    this.filters.push({ field: finalField, op: '==', value });
    return this;
  }

  neq(field: string, value: any) {
    let finalField = field;
    if (this.tableName === 'profiles') {
      if (field === 'user_id' || field === 'id') finalField = 'uid';
      if (field === 'IdNumber') finalField = 'PlayerId';
      if (field === 'is_public') finalField = 'is_profile_public';
      if (field === 'wallet_credits') finalField = 'wallet_amount';
    }
    this.filters.push({ field: finalField, op: '!=', value });
    return this;
  }

  ilike(field: string, pattern: string) {
    let finalField = field;
    if (this.tableName === 'profiles') {
      if (field === 'user_id' || field === 'id') finalField = 'uid';
      if (field === 'IdNumber') finalField = 'PlayerId';
      if (field === 'is_public') finalField = 'is_profile_public';
    }
    this.ilikeFilters.push({ field: finalField, pattern });
    return this;
  }

  or(queryStr: string) {
    this.orFilters.push(queryStr);
    return this;
  }

  order(field: string, { ascending = true } = {}) {
    this.orderField = field;
    this.orderAscending = ascending;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  maybeSingle() {
    this.isSingle = true;
    return this;
  }

  insert(data: any | any[]) {
    this.insertData = Array.isArray(data) ? data[0] : data;
    return this;
  }

  upsert(data: any | any[]) {
    this.insertData = Array.isArray(data) ? data[0] : data;
    return this;
  }

  update(data: any) {
    this.updateData = data;
    return this;
  }

  delete() {
    this.isDelete = true;
    return this;
  }

  async then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    try {
      const result = await this.execute();
      if (onfulfilled) return onfulfilled(result);
      return result;
    } catch (err) {
      if (onrejected) return onrejected(err);
      throw err;
    }
  }

  async fetchDocsFromFirestore(): Promise<any[]> {
    const colRef = collection(firestoreDb, this.tableName);

    // If we have an OR filter, specifically used for profile searches
    if (this.orFilters.length > 0 && this.tableName === 'profiles') {
      const orStr = this.orFilters[0];
      const parts = orStr.split(',');
      let searchVal = '';
      for (const part of parts) {
        const subparts = part.split('.eq.');
        if (subparts.length === 2) {
          searchVal = subparts[1];
          break;
        }
      }

      if (searchVal) {
        // Parallel queries to mimic 'OR' query in Firestore
        const q1 = query(colRef, where('PlayerId', '==', searchVal));
        const q2 = query(colRef, where('uid', '==', searchVal));
        const q3 = query(colRef, where('full_name', '==', searchVal));

        const [s1, s2, s3] = await Promise.all([
          getDocs(q1),
          getDocs(q2),
          getDocs(q3)
        ]);

        const mergedMap = new Map<string, any>();
        s1.forEach(docSnap => mergedMap.set(docSnap.id, { id: docSnap.id, ...docSnap.data() }));
        s2.forEach(docSnap => mergedMap.set(docSnap.id, { id: docSnap.id, ...docSnap.data() }));
        s3.forEach(docSnap => mergedMap.set(docSnap.id, { id: docSnap.id, ...docSnap.data() }));

        return Array.from(mergedMap.values()).map(p => mapProfileToSupabase(p));
      }
    }

    // Standard Query path
    let q = query(colRef);
    for (const filter of this.filters) {
      q = query(q, where(filter.field, filter.op, filter.value));
    }

    if (this.orderField) {
      let orderF = this.orderField;
      if (this.tableName === 'profiles') {
        if (this.orderField === 'user_id' || this.orderField === 'id') orderF = 'uid';
        if (this.orderField === 'IdNumber') orderF = 'PlayerId';
      }
      q = query(q, orderBy(orderF, this.orderAscending ? 'asc' : 'desc'));
    }

    if (this.limitCount) {
      q = query(q, limit(this.limitCount));
    }

    const querySnapshot = await getDocs(q);
    let results: any[] = [];
    querySnapshot.forEach((docSnap) => {
      const rawData = docSnap.data();
      const dataWithId = { id: docSnap.id, ...rawData };
      results.push(this.tableName === 'profiles' ? mapProfileToSupabase(dataWithId) : dataWithId);
    });

    // Handle high-accuracy, wildcard 'ilike' filters in-memory
    if (this.ilikeFilters.length > 0) {
      results = results.filter(item => {
        return this.ilikeFilters.every(filter => {
          const val = item[filter.field];
          if (val === null || val === undefined) return false;
          const cleanPattern = filter.pattern.replace(/%/g, '').toLowerCase();
          return String(val).toLowerCase().includes(cleanPattern);
        });
      });
    }

    return results;
  }

  async execute() {
    // 1. INSERT / UPSERT ACTIONS
    if (this.insertData) {
      const data = this.insertData;
      if (this.tableName === 'profiles') {
        const uid = data.id || data.user_id || firebaseAuth.currentUser?.uid || 'temp_uid';
        const mappedProfile = {
          uid: uid,
          email: data.email || firebaseAuth.currentUser?.email || '',
          full_name: data.full_name || '',
          bio: data.bio || '',
          PlayerId: data.IdNumber || data.PlayerId || '100' + Math.floor(10000 + Math.random() * 90000),
          is_profile_public: data.is_public !== undefined ? data.is_public : true,
          IsIdentityVerified: data.IsIdentityVerified || false,
          parents_email: data.parents_email || '',
          wallet_amount: data.wallet_credits !== undefined ? data.wallet_credits : (data.wallet_amount || 0),
          cryptic_token: data.cryptic_token || '',
          dob: data.dob || '',
          position: data.position || '',
          sport: data.sport || '',
          avatar_url: data.avatar_url || '',
          role: data.role || 'player',
          created_at: data.created_at || new Date().toISOString()
        };
        await setDoc(doc(firestoreDb, 'profiles', uid), mappedProfile);
        setCachedDoc('profiles', uid, mappedProfile);
        return { data: [mapProfileToSupabase(mappedProfile)], error: null };
      } else {
        const docId = data.id || doc(collection(firestoreDb, this.tableName)).id;
        const docRef = doc(firestoreDb, this.tableName, docId);
        const finalData = {
          id: docId,
          ...data,
          created_at: data.created_at || new Date().toISOString()
        };
        await setDoc(docRef, finalData);
        setCachedDoc(this.tableName, docId, finalData);
        return { data: [finalData], error: null };
      }
    }

    // 2. UPDATE ACTIONS
    if (this.updateData) {
      const data = this.updateData;
      let docId = '';
      const uidFilter = this.filters.find(f => f.field === 'uid' || f.field === 'user_id' || f.field === 'id');
      if (uidFilter) {
        docId = uidFilter.value;
      } else {
        const queryResults = await this.fetchDocsFromFirestore();
        if (queryResults && queryResults.length > 0) {
          docId = queryResults[0].id || queryResults[0].uid;
        }
      }

      if (!docId && this.tableName === 'profiles') {
        docId = firebaseAuth.currentUser?.uid || '';
      }

      if (docId) {
        if (this.tableName === 'profiles') {
          const mappedUpdate: any = {};
          if (data.full_name !== undefined) mappedUpdate.full_name = data.full_name;
          if (data.bio !== undefined) mappedUpdate.bio = data.bio;
          if (data.parents_email !== undefined) mappedUpdate.parents_email = data.parents_email;
          if (data.cryptic_token !== undefined) mappedUpdate.cryptic_token = data.cryptic_token;
          if (data.IsIdentityVerified !== undefined) mappedUpdate.IsIdentityVerified = data.IsIdentityVerified;
          if (data.is_public !== undefined) mappedUpdate.is_profile_public = data.is_public;
          if (data.wallet_credits !== undefined) mappedUpdate.wallet_amount = data.wallet_credits;
          
          for (const k in data) {
            if (!['id', 'user_id', 'IdNumber', 'is_public', 'wallet_credits'].includes(k)) {
              mappedUpdate[k] = data[k];
            }
          }
          await updateDoc(doc(firestoreDb, 'profiles', docId), mappedUpdate);
          invalidateDocCache('profiles', docId);
          return { data: [mapProfileToSupabase({ uid: docId, ...mappedUpdate })], error: null };
        } else {
          await updateDoc(doc(firestoreDb, this.tableName, docId), data);
          invalidateDocCache(this.tableName, docId);
          return { data: [{ id: docId, ...data }], error: null };
        }
      }
      return { data: null, error: { message: 'Document not found for update' } };
    }

    // 3. DELETE ACTIONS
    if (this.isDelete) {
      const queryResults = await this.fetchDocsFromFirestore();
      for (const docItem of queryResults) {
        const id = docItem.id || docItem.uid;
        if (id) {
          await deleteDoc(doc(firestoreDb, this.tableName, id));
          invalidateDocCache(this.tableName, id);
        }
      }
      return { data: queryResults, error: null };
    }

    // 4. SELECT ACTIONS (WITH READ-OPTIMIZATION CACHING)
    const queryParamsKey = JSON.stringify({
      filters: this.filters,
      ilike: this.ilikeFilters,
      or: this.orFilters,
      orderField: this.orderField,
      orderAscending: this.orderAscending,
      limit: this.limitCount
    });

    const cachedResult = getCachedQuery(this.tableName, queryParamsKey);
    if (cachedResult !== null) {
      if (this.isSingle) {
        return { data: cachedResult[0] || null, error: null };
      }
      return { data: cachedResult, error: null };
    }

    const results = await this.fetchDocsFromFirestore();
    setCachedQuery(this.tableName, queryParamsKey, results);

    if (this.isSingle) {
      return { data: results[0] || null, error: null };
    }
    return { data: results, error: null };
  }
}

// Proxied supabase client that delegates to Firebase when USE_SUPABASE is false
export const supabase = {
  auth: {
    signUp: async ({ email, password, options }: any) => {
      if (USE_SUPABASE) {
        return realSupabase.auth.signUp({ email, password, options });
      }
      try {
        const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        return { 
          data: { 
            user: { 
              id: userCredential.user.uid, 
              email: userCredential.user.email,
              user_metadata: options?.data || {}
            } 
          }, 
          error: null 
        };
      } catch (err: any) {
        return { data: { user: null }, error: { message: err.message } };
      }
    },

    signInWithPassword: async ({ email, password }: any) => {
      if (USE_SUPABASE) {
        return realSupabase.auth.signInWithPassword({ email, password });
      }
      try {
        const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
        return { 
          data: { 
            session: { 
              user: { 
                id: userCredential.user.uid, 
                email: userCredential.user.email 
              },
              access_token: 'firebase_tok_' + userCredential.user.uid
            } 
          }, 
          error: null 
        };
      } catch (err: any) {
        return { data: { session: null }, error: { message: err.message } };
      }
    },

    signOut: async () => {
      if (USE_SUPABASE) {
        return realSupabase.auth.signOut();
      }
      try {
        await firebaseSignOut(firebaseAuth);
        return { error: null };
      } catch (err: any) {
        return { error: { message: err.message } };
      }
    },

    getSession: async () => {
      if (USE_SUPABASE) {
        return realSupabase.auth.getSession();
      }
      const user = firebaseAuth.currentUser;
      if (!user) return { data: { session: null }, error: null };
      return {
        data: {
          session: {
            user: {
              id: user.uid,
              email: user.email,
              user_metadata: {}
            },
            access_token: 'firebase_tok_' + user.uid
          }
        },
        error: null
      };
    },

    getUser: async () => {
      if (USE_SUPABASE) {
        return realSupabase.auth.getUser();
      }
      const user = firebaseAuth.currentUser;
      if (!user) return { data: { user: null }, error: null };
      return {
        data: {
          user: {
            id: user.uid,
            email: user.email
          }
        },
        error: null
      };
    },

    resetPasswordForEmail: async (email: string, options?: any) => {
      if (USE_SUPABASE) {
        return realSupabase.auth.resetPasswordForEmail(email, options);
      }
      try {
        await sendPasswordResetEmail(firebaseAuth, email);
        return { data: {}, error: null };
      } catch (err: any) {
        return { data: null, error: { message: err.message } };
      }
    },

    onAuthStateChange: (callback: any) => {
      if (USE_SUPABASE) {
        return realSupabase.auth.onAuthStateChange(callback);
      }
      
      const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
        if (user) {
          const session = {
            user: {
              id: user.uid,
              email: user.email,
              user_metadata: {}
            },
            access_token: 'firebase_tok_' + user.uid
          };
          callback('SIGNED_IN', session);
        } else {
          callback('SIGNED_OUT', null);
        }
      });

      return {
        data: {
          subscription: {
            unsubscribe: () => unsubscribe()
          }
        }
      };
    }
  },

  from: (tableName: string) => {
    if (USE_SUPABASE) {
      return realSupabase.from(tableName);
    }
    return new FirestoreQueryBuilder(tableName);
  },

  storage: {
    from: (bucketName: string) => {
      // Storage operations ALWAYS use Supabase S3 bucket as requested
      return realSupabase.storage.from(bucketName);
    }
  },

  // Realtime channel definitions for compile-time safety
  channel: (name: string, options?: any) => {
    if (USE_SUPABASE) return realSupabase.channel(name, options);
    return {
      on: () => { return { subscribe: () => {} }; },
      subscribe: () => {},
      send: () => {}
    };
  },

  removeChannel: async (channel: any) => {
    if (USE_SUPABASE) return realSupabase.removeChannel(channel);
    return { error: null };
  }
};
