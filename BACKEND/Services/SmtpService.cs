using Backend.Models;
using MySql.Data.MySqlClient;
using System.Data;

public class SmtpService
{
    private readonly IConfiguration _config;

    public SmtpService(IConfiguration config)
    {
        _config = config;
    }

    public SmtpSettingsModel GetSmtpSettings()
    {
        SmtpSettingsModel smtp = new SmtpSettingsModel();

        string connStr = _config.GetConnectionString("InvAppCon");

        using (MySqlConnection conn = new MySqlConnection(connStr))
        {
            conn.Open();

            string query = "SELECT * FROM tbl_smtp_settings LIMIT 1";

            MySqlCommand cmd = new MySqlCommand(query, conn);
            MySqlDataReader reader = cmd.ExecuteReader();

            if (reader.Read())
            {
                smtp.Server = reader["server"].ToString();
                smtp.Port = Convert.ToInt32(reader["port"]);
                smtp.SenderName = reader["sender_name"].ToString();
                smtp.SenderEmail = reader["sender_email"].ToString();
                smtp.Username = reader["username"].ToString();
                smtp.Password = reader["password"].ToString();
                smtp.EnableSsl = Convert.ToBoolean(reader["enable_ssl"]);
            }
        }

        return smtp;
    }
}