import os
import numpy as np
import pandas as pd

def generate_procurement_dataset(num_samples=3500, random_seed=42):
    np.random.seed(random_seed)
    
    # 1. Normal / Baseline Tenders (~2870 samples)
    num_normal = int(num_samples * 0.82)
    
    price_z_score_normal = np.random.normal(0.05, 0.90, num_normal)
    ratio_to_estimate_normal = np.random.normal(0.96, 0.08, num_normal)
    bid_spread_variance_normal = np.random.uniform(0.015, 0.22, num_normal) # Overlaps with anomalies
    single_bidder_flag_normal = np.random.choice([0, 1], p=[0.88, 0.12], size=num_normal) # 12% normal sole bidders
    vendor_sole_bid_rate_normal = np.random.beta(1.2, 7, num_normal)
    win_rate_share_normal = np.random.beta(2, 6, num_normal)
    rotation_index_normal = np.random.beta(1.5, 8, num_normal)
    relationship_density_normal = np.random.beta(1.5, 6, num_normal)
    is_anomaly_normal = np.zeros(num_normal, dtype=int)
    
    # 2. Anomalous / Flagged Tenders (~630 samples)
    num_anomalous = num_samples - num_normal
    
    price_z_score_anomaly = np.random.exponential(1.4, num_anomalous) + 0.7
    ratio_to_estimate_anomaly = np.random.normal(1.18, 0.12, num_anomalous)
    bid_spread_variance_anomaly = np.random.uniform(0.002, 0.045, num_anomalous) # Realistic spread overlap
    single_bidder_flag_anomaly = np.random.choice([0, 1], p=[0.48, 0.52], size=num_anomalous)
    vendor_sole_bid_rate_anomaly = np.random.beta(4.5, 2, num_anomalous)
    win_rate_share_anomaly = np.random.beta(4, 2.5, num_anomalous)
    rotation_index_anomaly = np.random.beta(5, 2, num_anomalous)
    relationship_density_anomaly = np.random.beta(6, 2, num_anomalous)
    is_anomaly_anomaly = np.ones(num_anomalous, dtype=int)
    
    # Combine features
    df = pd.DataFrame({
        'price_z_score': np.concatenate([price_z_score_normal, price_z_score_anomaly]),
        'ratio_to_estimate': np.concatenate([ratio_to_estimate_normal, ratio_to_estimate_anomaly]),
        'bid_spread_variance': np.concatenate([bid_spread_variance_normal, bid_spread_variance_anomaly]),
        'single_bidder_flag': np.concatenate([single_bidder_flag_normal, single_bidder_flag_anomaly]),
        'vendor_sole_bid_rate': np.concatenate([vendor_sole_bid_rate_normal, vendor_sole_bid_rate_anomaly]),
        'win_rate_share': np.concatenate([win_rate_share_normal, win_rate_share_anomaly]),
        'rotation_index': np.concatenate([rotation_index_normal, rotation_index_anomaly]),
        'relationship_density': np.concatenate([relationship_density_normal, relationship_density_anomaly]),
        'is_anomaly': np.concatenate([is_anomaly_normal, is_anomaly_anomaly])
    })
    
    # Inject 3 font-mono;% realistic label noise (borderline audit ambiguity)
    noise_idx = np.random.choice(len(df), size=int(len(df) * 0.035), replace=False)
    df.loc[noise_idx, 'is_anomaly'] = 1 - df.loc[noise_idx, 'is_anomaly']
    
    # Shuffle dataset
    df = df.sample(frac=1.0, random_state=random_seed).reset_index(drop=True)
    
    output_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(output_dir, 'dataset.csv')
    df.to_csv(csv_path, index=False)
    
    print(f"Generated realistic procurement dataset with {len(df)} records ({df['is_anomaly'].sum()} anomalous). Saved to: {csv_path}")
    return csv_path

if __name__ == '__main__':
    generate_procurement_dataset()
