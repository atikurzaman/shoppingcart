using System;
using System.Data.SqlClient;

class Program
{
    static void Main()
    {
        string password = "Admin123!";
        string hash = BCrypt.Net.BCrypt.HashPassword(password, 11);
        Console.WriteLine($"Generated hash: {hash}");
        
        string connString = "Server=localhost;Database=ShoppingCartDb;Trusted_Connection=True;TrustServerCertificate=True";
        using (var conn = new SqlConnection(connString))
        {
            conn.Open();
            var cmd = new SqlCommand(@"
                IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = 'admin@shoppingcart.com')
                BEGIN
                    INSERT INTO Users (Email, FirstName, LastName, PhoneNumber, EmailConfirmed, Status, PasswordHash, CreatedAt, CreatedBy, IsDeleted)
                    VALUES ('admin@shoppingcart.com', 'Admin', 'User', '+880 1700000000', 1, 0, @hash, GETUTCDATE(), 'system', 0)
                END
                ELSE
                BEGIN
                    UPDATE Users SET PasswordHash = @hash WHERE Email = 'admin@shoppingcart.com'
                END", conn);
            cmd.Parameters.AddWithValue("@hash", hash);
            int rows = cmd.ExecuteNonQuery();
            Console.WriteLine($"Rows affected: {rows}");
        }
    }
}
