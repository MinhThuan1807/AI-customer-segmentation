import pandas as pd
import numpy as np

def generate_customers(n):
    data = {
        "CustomerID": range(1, n+1),
        "Age": np.random.randint(18, 65, n),
        "AnnualIncome": np.random.randint(20000, 100000, n),
        "SpendingScore": np.random.randint(1, 100, n),
        "PurchaseFrequency": np.random.randint(1, 30, n)
    }
    return pd.DataFrame(data)

# Tạo file
df_200 = generate_customers(200)
df_500 = generate_customers(500)

df_200.to_csv("customers_200.csv", index=False)
df_500.to_csv("customers_500.csv", index=False)

print("Done!")