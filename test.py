CONNECTION_STRING = "Database=postgres;Server=com-server.postgres.database.azure.com;User Id=comphortine;Password=siwende3545."

# Parse the connection string
connection_params = {}
for part in CONNECTION_STRING.split(';'):
    if '=' in part:
        key, value = part.split('=', 1)
        connection_params[key.lower()] = value
        
        
        
print(connection_params['database'])
print(connection_params['server'])
print(connection_params['user id'])
print(connection_params['password'])
