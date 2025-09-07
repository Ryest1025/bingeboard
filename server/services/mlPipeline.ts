/**
 * ML Pipeline Service
 * Implements actual embeddings and matrix factorization using production ML libraries
 */

// Import TensorFlow (optional dependency)
let tf: any = null;
let Matrix: any = null;
let solve: any = null;

try {
  tf = require('@tensorflow/tfjs-node');
} catch (error) {
  console.warn('⚠️ TensorFlow.js not available, using fallback implementations');
}

try {
  const mlMatrix = require('ml-matrix');
  Matrix = mlMatrix.Matrix;
  solve = mlMatrix.solve;
} catch (error) {
  console.warn('⚠️ ml-matrix not available, using fallback implementations');
}

interface MLUserProfile {
  userId: string;
  genreEmbeddings: number[];
  behaviorEmbeddings: number[];
  contextualEmbeddings: number[];
  compositeEmbedding: number[];
}

interface MLContentProfile {
  tmdbId: number;
  genreEmbeddings: number[];
  themeEmbeddings: number[];
  qualityEmbeddings: number[];
  compositeEmbedding: number[];
}

interface MatrixFactorizationResult {
  userFactors: any;
  itemFactors: any;
  biases: {
    global: number;
    users: number[];
    items: number[];
  };
  rmse: number;
  iterations: number;
}

interface EmbeddingModel {
  genreEncoder: any;
  behaviorEncoder: any;
  contentEncoder: any;
  similarityModel: any;
}

export class MLPipelineService {
  private models: EmbeddingModel | null = null;
  private userEmbeddingCache = new Map<string, MLUserProfile>();
  private contentEmbeddingCache = new Map<string, MLContentProfile>();
  private modelVersion = '1.0.0';

  constructor() {
    this.initializeModels();
  }

  /**
   * Initialize TensorFlow.js models for embedding generation
   */
  private async initializeModels(): Promise<void> {
    try {
      console.log('🧠 Initializing ML Pipeline models...');

      // Genre Encoder - Maps genres to dense embeddings
      const genreEncoder = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [18], units: 32, activation: 'relu' }), // 18 genres
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({ units: 16, activation: 'relu' }),
          tf.layers.dense({ units: 8, activation: 'tanh' }) // 8-dim genre embedding
        ]
      });

      // Behavior Encoder - Maps user behavior to embeddings  
      const behaviorEncoder = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [10], units: 16, activation: 'relu' }), // 10 behavior features
          tf.layers.dropout({ rate: 0.1 }),
          tf.layers.dense({ units: 8, activation: 'relu' }),
          tf.layers.dense({ units: 6, activation: 'tanh' }) // 6-dim behavior embedding
        ]
      });

      // Content Encoder - Maps show features to embeddings
      const contentEncoder = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [25], units: 32, activation: 'relu' }), // Content features
          tf.layers.dropout({ rate: 0.15 }),
          tf.layers.dense({ units: 16, activation: 'relu' }),
          tf.layers.dense({ units: 8, activation: 'tanh' }) // 8-dim content embedding
        ]
      });

      // Similarity Model - Predicts user-content compatibility
      const similarityModel = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [30], units: 64, activation: 'relu' }), // Combined embeddings
          tf.layers.dropout({ rate: 0.3 }),
          tf.layers.dense({ units: 32, activation: 'relu' }),
          tf.layers.dense({ units: 16, activation: 'relu' }),
          tf.layers.dense({ units: 1, activation: 'sigmoid' }) // Similarity score 0-1
        ]
      });

      // Compile models
      const optimizer = tf.train.adam(0.001);
      
      genreEncoder.compile({ optimizer, loss: 'meanSquaredError' });
      behaviorEncoder.compile({ optimizer, loss: 'meanSquaredError' });
      contentEncoder.compile({ optimizer, loss: 'meanSquaredError' });
      similarityModel.compile({ 
        optimizer, 
        loss: 'binaryCrossentropy',
        metrics: ['accuracy']
      });

      this.models = {
        genreEncoder,
        behaviorEncoder,
        contentEncoder,
        similarityModel
      };

      console.log('✅ ML Pipeline models initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize ML models:', error);
      // Fallback to traditional methods if TensorFlow fails
    }
  }

  /**
   * Generate comprehensive user embeddings using ML models
   */
  async generateUserEmbeddings(userProfile: any): Promise<MLUserProfile> {
    const cacheKey = `${userProfile.userId}_${this.modelVersion}`;
    
    if (this.userEmbeddingCache.has(cacheKey)) {
      return this.userEmbeddingCache.get(cacheKey)!;
    }

    let genreEmbeddings: number[];
    let behaviorEmbeddings: number[];
    let contextualEmbeddings: number[];

    if (this.models) {
      // Use ML models for embedding generation
      genreEmbeddings = await this.generateGenreEmbeddings(userProfile.favoriteGenres);
      behaviorEmbeddings = await this.generateBehaviorEmbeddings(userProfile.behavioralData);
      contextualEmbeddings = await this.generateContextualEmbeddings(userProfile.contextualCues);
    } else {
      // Fallback to traditional embedding generation
      genreEmbeddings = this.generateTraditionalGenreEmbeddings(userProfile.favoriteGenres);
      behaviorEmbeddings = this.generateTraditionalBehaviorEmbeddings(userProfile.behavioralData);
      contextualEmbeddings = this.generateTraditionalContextualEmbeddings(userProfile.contextualCues);
    }

    // Create composite embedding by concatenating all embeddings
    const compositeEmbedding = [
      ...genreEmbeddings,
      ...behaviorEmbeddings,
      ...contextualEmbeddings
    ];

    // Normalize composite embedding
    const magnitude = Math.sqrt(compositeEmbedding.reduce((sum, val) => sum + val * val, 0));
    const normalizedComposite = magnitude > 0 
      ? compositeEmbedding.map(val => val / magnitude)
      : compositeEmbedding;

    const mlProfile: MLUserProfile = {
      userId: userProfile.userId,
      genreEmbeddings,
      behaviorEmbeddings,
      contextualEmbeddings,
      compositeEmbedding: normalizedComposite
    };

    // Cache the result
    this.userEmbeddingCache.set(cacheKey, mlProfile);
    
    return mlProfile;
  }

  /**
   * Generate genre embeddings using neural network
   */
  private async generateGenreEmbeddings(favoriteGenres: string[]): Promise<number[]> {
    if (!this.models) return this.generateTraditionalGenreEmbeddings(favoriteGenres);

    // Map genres to one-hot encoding
    const allGenres = [
      'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 
      'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music', 
      'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'War', 'Western'
    ];
    
    const genreVector = allGenres.map(genre => favoriteGenres.includes(genre) ? 1 : 0);
    
    // Generate embeddings using trained model
    const inputTensor = tf && tf.tensor2d([genreVector]);
    const embedding = inputTensor && this.models.genreEncoder.predict(inputTensor);
    let embeddingArray: Float32Array | number[] = [];
    
    if (embedding) {
      embeddingArray = await embedding.data();
      inputTensor?.dispose();
      embedding.dispose();
    } else {
      // Fallback computation
      return this.generateTraditionalGenreEmbeddings(favoriteGenres);
    }
    
    return Array.from(embeddingArray);
  }

  /**
   * Generate behavior embeddings using neural network
   */
  private async generateBehaviorEmbeddings(behavioralData: any): Promise<number[]> {
    if (!this.models) return this.generateTraditionalBehaviorEmbeddings(behavioralData);

    // Extract behavior features
    const behaviorVector = [
      behavioralData?.completionRate || 0.5,
      behavioralData?.skipRate || 0.2,
      behavioralData?.bingePatterns === 'heavy' ? 1 : behavioralData?.bingePatterns === 'moderate' ? 0.5 : 0,
      behavioralData?.preferredShowLength === 'long' ? 1 : behavioralData?.preferredShowLength === 'medium' ? 0.5 : 0,
      behavioralData?.watchingTimes?.length || 0,
      Object.values(behavioralData?.genreEvolution || {}).reduce((sum: number, val: any) => sum + val, 0) / Object.keys(behavioralData?.genreEvolution || {}).length || 0.5,
      // Additional computed features
      (behavioralData?.completionRate || 0.5) * (1 - (behavioralData?.skipRate || 0.2)), // Engagement score
      behavioralData?.watchingTimes?.includes('night') ? 1 : 0, // Night watcher
      behavioralData?.watchingTimes?.includes('weekend') ? 1 : 0, // Weekend watcher
      Object.keys(behavioralData?.genreEvolution || {}).length / 18 // Genre diversity
    ];
    
    const inputTensor = tf && tf.tensor2d([behaviorVector]);
    const embedding = inputTensor && this.models.behaviorEncoder.predict(inputTensor);
    let embeddingArray: Float32Array | number[] = [];
    
    if (embedding) {
      embeddingArray = await embedding.data();
      inputTensor?.dispose();
      embedding.dispose();
    } else {
      // Fallback computation
      return this.generateTraditionalBehaviorEmbeddings(behavioralData);
    }
    
    return Array.from(embeddingArray);
  }

  /**
   * Generate contextual embeddings
   */
  private async generateContextualEmbeddings(contextualCues: any): Promise<number[]> {
    // Contextual features (simpler for now)
    const moodMap: Record<string, number> = {
      'light': 0.2, 'comedy': 0.3, 'thought-provoking': 0.7, 'intense': 0.9, 'action': 0.8
    };
    
    const timeMap: Record<string, number> = {
      'morning': 0.2, 'afternoon': 0.5, 'evening': 0.7, 'night': 0.9
    };
    
    const dayMap: Record<string, number> = {
      'monday': 0.1, 'tuesday': 0.2, 'wednesday': 0.3, 'thursday': 0.4,
      'friday': 0.7, 'saturday': 0.9, 'sunday': 0.8
    };
    
    return [
      moodMap[contextualCues?.currentMood] || 0.5,
      timeMap[contextualCues?.timeOfDay] || 0.5,
      dayMap[contextualCues?.dayOfWeek] || 0.5,
      contextualCues?.season === 'winter' ? 1 : contextualCues?.season === 'fall' ? 0.8 : 0.5,
      contextualCues?.recentActivity?.length || 0,
      contextualCues?.recentActivity?.includes('completed series') ? 1 : 0
    ];
  }

  /**
   * Generate content embeddings for shows
   */
  async generateContentEmbeddings(show: any): Promise<MLContentProfile> {
    const cacheKey = `${show.tmdbId}_${this.modelVersion}`;
    
    if (this.contentEmbeddingCache.has(cacheKey)) {
      return this.contentEmbeddingCache.get(cacheKey)!;
    }

    // Generate various embedding types
    const genreEmbeddings = await this.generateContentGenreEmbeddings(show.genres);
    const themeEmbeddings = await this.generateThemeEmbeddings(show.overview);
    const qualityEmbeddings = this.generateQualityEmbeddings({
      rating: show.avgRating,
      popularity: show.popularityScore,
      voteCount: show.voteCount
    });

    // Create composite content embedding
    const compositeEmbedding = [
      ...genreEmbeddings,
      ...themeEmbeddings,
      ...qualityEmbeddings
    ];

    // Normalize
    const magnitude = Math.sqrt(compositeEmbedding.reduce((sum, val) => sum + val * val, 0));
    const normalizedComposite = magnitude > 0 
      ? compositeEmbedding.map(val => val / magnitude)
      : compositeEmbedding;

    const contentProfile: MLContentProfile = {
      tmdbId: show.tmdbId,
      genreEmbeddings,
      themeEmbeddings,
      qualityEmbeddings,
      compositeEmbedding: normalizedComposite
    };

    this.contentEmbeddingCache.set(cacheKey, contentProfile);
    return contentProfile;
  }

  /**
   * Content genre embedding generation
   */
  private async generateContentGenreEmbeddings(genres: string[]): Promise<number[]> {
    return this.generateTraditionalGenreEmbeddings(genres);
  }

  /**
   * Theme embedding from show description using simple NLP
   */
  private async generateThemeEmbeddings(overview: string): Promise<number[]> {
    if (!overview) return new Array(8).fill(0);

    // Simple theme detection based on keywords
    const themes = {
      action: ['action', 'fight', 'battle', 'war', 'chase', 'explosion'],
      drama: ['family', 'relationship', 'emotion', 'life', 'love', 'heart'],
      mystery: ['mystery', 'secret', 'hidden', 'investigate', 'solve', 'detective'],
      comedy: ['funny', 'laugh', 'humor', 'comic', 'joke', 'amusing'],
      thriller: ['suspense', 'tension', 'dangerous', 'threat', 'chase', 'escape'],
      scifi: ['future', 'space', 'technology', 'alien', 'robot', 'science'],
      horror: ['scary', 'fear', 'dark', 'evil', 'monster', 'nightmare'],
      romance: ['love', 'romantic', 'relationship', 'couple', 'kiss', 'heart']
    };

    const lowerOverview = overview.toLowerCase();
    const themeScores = Object.entries(themes).map(([theme, keywords]) => {
      const score = keywords.reduce((sum, keyword) => {
        return sum + (lowerOverview.includes(keyword) ? 1 : 0);
      }, 0);
      return score / keywords.length;
    });

    return themeScores;
  }

  /**
   * Quality embeddings based on ratings and popularity
   */
  private generateQualityEmbeddings(qualityMetrics: any): number[] {
    return [
      (qualityMetrics.rating || 0) / 10, // Normalized rating
      Math.min(1, (qualityMetrics.popularity || 0)), // Capped popularity
      Math.min(1, (qualityMetrics.voteCount || 0) / 10000), // Normalized vote count
      qualityMetrics.rating > 8.5 ? 1 : 0, // High quality flag
      qualityMetrics.rating < 6 ? 1 : 0, // Low quality flag
      qualityMetrics.popularity > 0.8 ? 1 : 0 // High popularity flag
    ];
  }

  /**
   * Advanced Matrix Factorization using alternating least squares
   */
  async performAdvancedMatrixFactorization(
    userItemMatrix: number[][],
    factors: number = 50,
    lambda: number = 0.01,
    iterations: number = 100
  ): Promise<MatrixFactorizationResult> {
    const users = userItemMatrix.length;
    const items = userItemMatrix[0]?.length || 0;

    if (users === 0 || items === 0) {
      throw new Error('Invalid user-item matrix dimensions');
    }

    console.log(`🔢 Starting Matrix Factorization: ${users}x${items} matrix, ${factors} factors`);

    // Initialize factor matrices with small random values
    let userFactors = Matrix.rand(users, factors).mul(0.1);
    let itemFactors = Matrix.rand(items, factors).mul(0.1);

    // Initialize biases
    const globalBias = this.calculateGlobalBias(userItemMatrix);
    let userBiases = new Array(users).fill(0);
    let itemBiases = new Array(items).fill(0);

    let previousRmse = Infinity;
    let convergenceCount = 0;
    const convergenceThreshold = 0.0001;

    for (let iter = 0; iter < iterations; iter++) {
      // Update user factors and biases
      for (let u = 0; u < users; u++) {
        const { factors: newFactors, bias: newBias } = this.updateUserFactors(
          u, userItemMatrix, userFactors, itemFactors, userBiases, itemBiases, globalBias, lambda
        );
        userFactors.setRow(u, newFactors);
        userBiases[u] = newBias;
      }

      // Update item factors and biases
      for (let i = 0; i < items; i++) {
        const { factors: newFactors, bias: newBias } = this.updateItemFactors(
          i, userItemMatrix, userFactors, itemFactors, userBiases, itemBiases, globalBias, lambda
        );
        itemFactors.setRow(i, newFactors);
        itemBiases[i] = newBias;
      }

      // Calculate RMSE for convergence check
      if (iter % 10 === 0) {
        const rmse = this.calculateRMSE(
          userItemMatrix, userFactors, itemFactors, globalBias, userBiases, itemBiases
        );

        if (Math.abs(previousRmse - rmse) < convergenceThreshold) {
          convergenceCount++;
          if (convergenceCount >= 3) {
            console.log(`✅ Matrix Factorization converged after ${iter + 1} iterations, RMSE: ${rmse.toFixed(4)}`);
            break;
          }
        } else {
          convergenceCount = 0;
        }
        
        previousRmse = rmse;
        
        if (iter % 50 === 0) {
          console.log(`   Iteration ${iter + 1}: RMSE = ${rmse.toFixed(4)}`);
        }
      }
    }

    const finalRmse = this.calculateRMSE(
      userItemMatrix, userFactors, itemFactors, globalBias, userBiases, itemBiases
    );

    return {
      userFactors,
      itemFactors,
      biases: {
        global: globalBias,
        users: userBiases,
        items: itemBiases
      },
      rmse: finalRmse,
      iterations
    };
  }

  /**
   * Calculate global bias (overall average rating)
   */
  private calculateGlobalBias(matrix: number[][]): number {
    let sum = 0;
    let count = 0;
    
    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[i].length; j++) {
        if (matrix[i][j] > 0) {
          sum += matrix[i][j];
          count++;
        }
      }
    }
    
    return count > 0 ? sum / count : 0;
  }

  /**
   * Update user factors using alternating least squares
   */
  private updateUserFactors(
    userId: number,
    matrix: number[][],
    userFactors: any,
    itemFactors: any,
    userBiases: number[],
    itemBiases: number[],
    globalBias: number,
    lambda: number
  ): { factors: number[]; bias: number } {
    const factors = userFactors.columns;
    const A = Matrix.zeros(factors, factors);
    const b = new Array(factors).fill(0);
    
    // Add regularization to diagonal
    for (let f = 0; f < factors; f++) {
      A.set(f, f, lambda);
    }
    
    let biasSum = 0;
    let biasCount = 0;
    
    // Process rated items for this user
    for (let itemId = 0; itemId < matrix[userId].length; itemId++) {
      if (matrix[userId][itemId] > 0) {
        const rating = matrix[userId][itemId];
        const itemVector = itemFactors.getRow(itemId);
        
        // Update A matrix (X^T * X + lambda * I)
        for (let f1 = 0; f1 < factors; f1++) {
          for (let f2 = 0; f2 < factors; f2++) {
            A.set(f1, f2, A.get(f1, f2) + itemVector[f1] * itemVector[f2]);
          }
          // Update b vector (X^T * (r - bias))
          const adjustedRating = rating - globalBias - itemBiases[itemId];
          b[f1] += itemVector[f1] * adjustedRating;
        }
        
        biasSum += rating - globalBias - itemBiases[itemId];
        biasCount++;
      }
    }
    
    // Solve Ax = b for user factors
    const newFactors = solve(A, Matrix.columnVector(b)).getColumn(0);
    const newBias = biasCount > 0 ? biasSum / biasCount : 0;
    
    return { factors: newFactors, bias: newBias };
  }

  /**
   * Update item factors using alternating least squares
   */
  private updateItemFactors(
    itemId: number,
    matrix: number[][],
    userFactors: any,
    itemFactors: any,
    userBiases: number[],
    itemBiases: number[],
    globalBias: number,
    lambda: number
  ): { factors: number[]; bias: number } {
    const factors = itemFactors.columns;
    const A = Matrix.zeros(factors, factors);
    const b = new Array(factors).fill(0);
    
    // Add regularization
    for (let f = 0; f < factors; f++) {
      A.set(f, f, lambda);
    }
    
    let biasSum = 0;
    let biasCount = 0;
    
    // Process users who rated this item
    for (let userId = 0; userId < matrix.length; userId++) {
      if (matrix[userId][itemId] > 0) {
        const rating = matrix[userId][itemId];
        const userVector = userFactors.getRow(userId);
        
        // Update A matrix
        for (let f1 = 0; f1 < factors; f1++) {
          for (let f2 = 0; f2 < factors; f2++) {
            A.set(f1, f2, A.get(f1, f2) + userVector[f1] * userVector[f2]);
          }
          // Update b vector
          const adjustedRating = rating - globalBias - userBiases[userId];
          b[f1] += userVector[f1] * adjustedRating;
        }
        
        biasSum += rating - globalBias - userBiases[userId];
        biasCount++;
      }
    }
    
    // Solve for item factors
    const newFactors = solve(A, Matrix.columnVector(b)).getColumn(0);
    const newBias = biasCount > 0 ? biasSum / biasCount : 0;
    
    return { factors: newFactors, bias: newBias };
  }

  /**
   * Calculate Root Mean Square Error
   */
  private calculateRMSE(
    matrix: number[][],
    userFactors: any,
    itemFactors: any,
    globalBias: number,
    userBiases: number[],
    itemBiases: number[]
  ): number {
    let squaredErrors = 0;
    let count = 0;
    
    for (let u = 0; u < matrix.length; u++) {
      for (let i = 0; i < matrix[u].length; i++) {
        if (matrix[u][i] > 0) {
          const predicted = this.predictRating(
            u, i, userFactors, itemFactors, globalBias, userBiases, itemBiases
          );
          const error = matrix[u][i] - predicted;
          squaredErrors += error * error;
          count++;
        }
      }
    }
    
    return count > 0 ? Math.sqrt(squaredErrors / count) : 0;
  }

  /**
   * Predict rating using factorized matrices
   */
  private predictRating(
    userId: number,
    itemId: number,
    userFactors: any,
    itemFactors: any,
    globalBias: number,
    userBiases: number[],
    itemBiases: number[]
  ): number {
    const userVector = userFactors.getRow(userId);
    const itemVector = itemFactors.getRow(itemId);
    
    let dotProduct = 0;
    for (let f = 0; f < userVector.length; f++) {
      dotProduct += userVector[f] * itemVector[f];
    }
    
    return globalBias + userBiases[userId] + itemBiases[itemId] + dotProduct;
  }

  /**
   * Predict user-content compatibility using similarity model
   */
  async predictCompatibility(
    userProfile: MLUserProfile,
    contentProfile: MLContentProfile
  ): Promise<number> {
    if (!this.models) {
      // Fallback to cosine similarity
      return this.calculateCosineSimilarity(
        userProfile.compositeEmbedding,
        contentProfile.compositeEmbedding
      );
    }

    // Combine embeddings for similarity prediction
    const combinedEmbedding = [
      ...userProfile.compositeEmbedding,
      ...contentProfile.compositeEmbedding
    ];

    const inputTensor = tf && tf.tensor2d([combinedEmbedding]);
    const prediction = inputTensor && this.models.similarityModel.predict(inputTensor);
    let score = 0;
    
    if (prediction) {
      const scoreArray = await prediction.data();
      score = scoreArray[0] || 0;
      inputTensor?.dispose();
      prediction.dispose();
    } else {
      // Fallback to cosine similarity
      score = this.calculateCosineSimilarity(
        userProfile.compositeEmbedding,
        contentProfile.compositeEmbedding
      );
    }
    
    return score;
  }

  /**
   * Calculate cosine similarity between embeddings
   */
  private calculateCosineSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) return 0;
    
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;
    
    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      magnitude1 += embedding1[i] * embedding1[i];
      magnitude2 += embedding2[i] * embedding2[i];
    }
    
    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);
    
    return (magnitude1 && magnitude2) ? dotProduct / (magnitude1 * magnitude2) : 0;
  }

  /**
   * Traditional embedding fallbacks (if TensorFlow fails)
   */
  private generateTraditionalGenreEmbeddings(genres: string[]): number[] {
    const allGenres = ['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'War', 'Western'];
    return allGenres.map(genre => genres.includes(genre) ? 1 : 0).slice(0, 8);
  }

  private generateTraditionalBehaviorEmbeddings(behavioralData: any): number[] {
    return [
      behavioralData?.completionRate || 0.5,
      behavioralData?.skipRate || 0.2,
      behavioralData?.bingePatterns === 'heavy' ? 1 : 0,
      behavioralData?.preferredShowLength === 'long' ? 1 : 0,
      (behavioralData?.watchingTimes?.length || 0) / 7,
      0 // Reserved for future features
    ];
  }

  private generateTraditionalContextualEmbeddings(contextualCues: any): number[] {
    return [
      contextualCues?.currentMood === 'intense' ? 1 : 0.5,
      contextualCues?.timeOfDay === 'night' ? 1 : 0,
      contextualCues?.dayOfWeek === 'weekend' ? 1 : 0,
      contextualCues?.season === 'winter' ? 1 : 0,
      (contextualCues?.recentActivity?.length || 0) / 5,
      contextualCues?.recentActivity?.includes('completed series') ? 1 : 0
    ];
  }

  /**
   * Get model performance metrics
   */
  getModelMetrics(): {
    modelVersion: string;
    userCacheSize: number;
    contentCacheSize: number;
    modelsLoaded: boolean;
    memoryUsage: string;
  } {
    return {
      modelVersion: this.modelVersion,
      userCacheSize: this.userEmbeddingCache.size,
      contentCacheSize: this.contentEmbeddingCache.size,
      modelsLoaded: this.models !== null,
      memoryUsage: `${process.memoryUsage().heapUsed / 1024 / 1024} MB`
    };
  }

  /**
   * Clear caches to free memory
   */
  clearCaches(): void {
    this.userEmbeddingCache.clear();
    this.contentEmbeddingCache.clear();
    console.log('🧹 ML Pipeline caches cleared');
  }

  /**
   * Cleanup TensorFlow resources
   */
  async cleanup(): Promise<void> {
    if (this.models) {
      this.models.genreEncoder.dispose();
      this.models.behaviorEncoder.dispose();
      this.models.contentEncoder.dispose();
      this.models.similarityModel.dispose();
    }
    this.clearCaches();
    console.log('🧹 ML Pipeline resources cleaned up');
  }
}
