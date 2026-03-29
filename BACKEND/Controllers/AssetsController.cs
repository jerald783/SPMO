using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using MySql.Data.MySqlClient;
using System.Data;
using BACKEND.Models;

namespace BACKEND.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AssetsController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        public AssetsController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        private MySqlConnection GetConnection()
        {
            return new MySqlConnection(_configuration.GetConnectionString("InvAppCon"));
        }

        [HttpGet]
        public IActionResult Get()
        {
            // string query = @"SELECT *FROM Assets";
            string query = @"SELECT Id,PPE, Fund_Cluster,CollCode, Name, Desc1, Provider_Name,
                            DATE_FORMAT(AnDate, '%Y-%m-%d') AS AnDate, 
                            PN, PAR, Qty, UM, UCost, TCost, UserName, Email, CurrentUser, EqStatus ,SerialNumber,Location,UserId
                            FROM tbl_assets";

            DataTable table = new();
            try
            {
                using (var con = GetConnection())
                {
                    using (var cmd = new MySqlCommand(query, con))
                    {
                        con.Open();
                        using (var reader = cmd.ExecuteReader())
                        {
                            table.Load(reader);
                        }
                    }
                }
                return Ok(table);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal Server Error: {ex.Message}");
            }
        }

        [HttpPost]
        public IActionResult Post(AssetModel Ass)
        {
            string query = @"INSERT INTO tbl_assets(PPE,Fund_Cluster,CollCode, Name, Desc1,Provider_Name, AnDate, PN, PAR, Qty, UM, UCost, TCost, UserName, Email, CurrentUser, EqStatus,SerialNumber,Location,UserId) 
                             VALUES (@PPE,@Fund_Cluster,@CollCode, @Name, @Desc1, @Provider_Name, @AnDate, @PN, @PAR, @Qty, @UM, @UCost, @TCost, @UserName, @Email, @CurrentUser, @EqStatus,@SerialNumber,@Location,@UserId)";

            try
            {
                using (var con = GetConnection())
                {
                    using (var cmd = new MySqlCommand(query, con))
                    {
                        cmd.Parameters.AddWithValue("PPE", Ass.PPE);
                        cmd.Parameters.AddWithValue("Fund_Cluster", Ass.Fund_Cluster);
                        cmd.Parameters.AddWithValue("@CollCode", Ass.CollCode);
                        cmd.Parameters.AddWithValue("@Name", Ass.Name);
                        cmd.Parameters.AddWithValue("@Desc1", Ass.Desc1);
                        cmd.Parameters.AddWithValue("@Provider_Name", Ass.Provider_Name);
                        cmd.Parameters.AddWithValue("@AnDate", Ass.AnDate);
                        cmd.Parameters.AddWithValue("@PN", Ass.PN);
                        cmd.Parameters.AddWithValue("@PAR", Ass.PAR);
                        cmd.Parameters.AddWithValue("@Qty", Ass.Qty);
                        cmd.Parameters.AddWithValue("@UM", Ass.UM);
                        cmd.Parameters.AddWithValue("@UCost", Ass.UCost);
                        cmd.Parameters.AddWithValue("@TCost", Ass.TCost);
                        cmd.Parameters.AddWithValue("@UserName", Ass.UserName);
                        cmd.Parameters.AddWithValue("@Email", Ass.Email);
                        cmd.Parameters.AddWithValue("@CurrentUser", Ass.CurrentUser);
                        cmd.Parameters.AddWithValue("@EqStatus", Ass.EqStatus);
                        cmd.Parameters.AddWithValue("@SerialNumber", Ass.SerialNumber);
                        cmd.Parameters.AddWithValue("@Location", Ass.Location);
                        cmd.Parameters.AddWithValue("@UserId", Ass.UserId);
                        con.Open();
                        cmd.ExecuteNonQuery();
                    }
                }
                return Ok(new { message = "Added Successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal Server Error: {ex.Message}");
            }
        }

        [HttpPut]
        public IActionResult Put(AssetModel Ass)
        {
            string query = @"
        UPDATE tbl_assets SET 
            PPE = @PPE,
            Fund_Cluster = @Fund_Cluster,
            CollCode = @CollCode,
            Name = @Name,
            Desc1 = @Desc1,
            Provider_Name = @Provider_Name,
            AnDate = @AnDate,
            PN = @PN,
            PAR = @PAR,
            Qty = @Qty,
            UM = @UM,
            UCost = @UCost,
            TCost = @TCost,
            UserName = @UserName,
            Email = @Email,
            CurrentUser = @CurrentUser,
            EqStatus = @EqStatus,
            SerialNumber = @SerialNumber,
            Location = @Location,
            UserId = @UserId
        WHERE Id = @Id";

            try
            {
                using (var con = GetConnection())
                {
                    using (var cmd = new MySqlCommand(query, con))
                    {
                        cmd.Parameters.AddWithValue("@Id", Ass.Id);
                        cmd.Parameters.AddWithValue("@PPE", Ass.PPE);
                        cmd.Parameters.AddWithValue("@Fund_Cluster", Ass.Fund_Cluster);
                        cmd.Parameters.AddWithValue("@CollCode", Ass.CollCode);
                        cmd.Parameters.AddWithValue("@Name", Ass.Name);
                        cmd.Parameters.AddWithValue("@Desc1", Ass.Desc1);
                        cmd.Parameters.AddWithValue("@Provider_Name", Ass.Provider_Name);
                        cmd.Parameters.AddWithValue("@AnDate", Ass.AnDate);
                        cmd.Parameters.AddWithValue("@PN", Ass.PN);
                        cmd.Parameters.AddWithValue("@PAR", Ass.PAR);
                        cmd.Parameters.AddWithValue("@Qty", Ass.Qty);
                        cmd.Parameters.AddWithValue("@UM", Ass.UM);
                        cmd.Parameters.AddWithValue("@UCost", Ass.UCost);
                        cmd.Parameters.AddWithValue("@TCost", Ass.TCost);
                        cmd.Parameters.AddWithValue("@UserName", Ass.UserName);
                        cmd.Parameters.AddWithValue("@Email", Ass.Email);
                        cmd.Parameters.AddWithValue("@CurrentUser", Ass.CurrentUser);
                        cmd.Parameters.AddWithValue("@EqStatus", Ass.EqStatus);
                        cmd.Parameters.AddWithValue("@SerialNumber", Ass.SerialNumber);
                        cmd.Parameters.AddWithValue("@Location", Ass.Location);
                        cmd.Parameters.AddWithValue("@UserId", Ass.UserId);

                        con.Open();
                        int rowsAffected = cmd.ExecuteNonQuery();

                        if (rowsAffected > 0)
                            return Ok(new { message = "Updated Successfully" });
                        else
                            return NotFound(new { message = "No record found with that Id" });
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal Server Error: {ex.Message}");
            }
        }
        [HttpGet("usersemail")]
        public async Task<IActionResult> GetRoles()
        {
            string query = "SELECT UserId AS id, Email AS Emails FROM tbl_users";
            DataTable table = new();

            try
            {
                using var con = GetConnection();
                using var cmd = new MySqlCommand(query, con);

                await con.OpenAsync();
                using var reader = await cmd.ExecuteReaderAsync();
                table.Load(reader);

                var usersemail = table.AsEnumerable().Select(row => new
                {
                    id = row.Field<int>("id"),
                    Emails = row.Field<string>("Emails")
                });

                return Ok(usersemail);
            }
            catch
            {
                return StatusCode(500, new { message = "Error retrieving roles." });
            }
        }


        [HttpDelete("{Id}")]
        public IActionResult Delete(int Id)
        {
            string query = "DELETE FROM tbl_assets WHERE Id = @Id";

            try
            {
                using (var con = GetConnection())
                {
                    using (var cmd = new MySqlCommand(query, con))
                    {
                        cmd.Parameters.AddWithValue("@Id", Id);
                        con.Open();
                        cmd.ExecuteNonQuery();
                    }
                }
                return Ok(new { message = "Deleted Successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal Server Error: {ex.Message}");
            }
        }

        [HttpPut("BulkTransfer")]
        public IActionResult BulkTransfer([FromBody] BulkTransferRequest request)
        {
            if (request == null || request.Ids == null || request.Ids.Count == 0 || string.IsNullOrWhiteSpace(request.NewEmail))
            {
                return BadRequest(new { message = "Invalid request." });
            }

            try
            {
                using var con = GetConnection();
                con.Open();

                //  Validate if NewEmail exists in Users
                string checkUserQuery = "SELECT COUNT(*) FROM tbl_users WHERE Email = @Email";
                using (var checkCmd = new MySqlCommand(checkUserQuery, con))
                {
                    checkCmd.Parameters.AddWithValue("@Email", request.NewEmail);
                    var exists = Convert.ToInt32(checkCmd.ExecuteScalar());
                    if (exists == 0)
                    {
                        return BadRequest(new { message = "Target user does not exist." });
                    }
                }

                //  Use transaction
                using var transaction = con.BeginTransaction();
                using var cmd = new MySqlCommand();
                cmd.Connection = con;
                cmd.Transaction = transaction;

                //  Build secure IN clause with parameters
                var idParams = request.Ids.Select((id, index) => $"@Id{index}").ToList();

                // 🔹 Get Property Numbers before update
                string selectQuery = $@"
            SELECT PAR 
            FROM tbl_assets 
            WHERE Id IN ({string.Join(",", idParams)})";

                var propertyNumbers = new List<string>();
                using (var selectCmd = new MySqlCommand(selectQuery, con, transaction))
                {
                    for (int i = 0; i < request.Ids.Count; i++)
                    {
                        selectCmd.Parameters.AddWithValue($"@Id{i}", request.Ids[i]);
                    }

                    using (var reader = selectCmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            propertyNumbers.Add(reader["PAR"].ToString());
                        }
                    }
                }

                // 🔹 Update assets
                cmd.CommandText = $@"
            UPDATE tbl_assets 
            SET CurrentUser = @NewEmail
            WHERE Id IN ({string.Join(",", idParams)})";

                cmd.Parameters.AddWithValue("@NewEmail", request.NewEmail);
                for (int i = 0; i < request.Ids.Count; i++)
                {
                    cmd.Parameters.AddWithValue($"@Id{i}", request.Ids[i]);
                }

                int rowsAffected = cmd.ExecuteNonQuery();

                // 🔹 Log transfer with Property Numbers
                string auditQuery = @"INSERT INTO log_transferasset (Action, PerformedBy, PerformedAt, Details)
                              VALUES (@Action, @PerformedBy, NOW(), @Details)";
                using var auditCmd = new MySqlCommand(auditQuery, con, transaction);
                auditCmd.Parameters.AddWithValue("@Action", "BulkTransfer");
                auditCmd.Parameters.AddWithValue("@PerformedBy", User.Identity?.Name ?? "System");
                auditCmd.Parameters.AddWithValue("@Details",
                    $"Transferred {rowsAffected} assets (PAR: {string.Join(", ", propertyNumbers)}) to {request.NewEmail}");
                auditCmd.ExecuteNonQuery();

                transaction.Commit();

                return Ok(new
                {
                    message = $"✅ {rowsAffected} assets transferred to {request.NewEmail}",
                    transferredPropNos = propertyNumbers
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Internal Server Error: {ex.Message}" });
            }
        }

        [HttpGet("GetAssetsByUser/{identifier}")]
        public IActionResult GetAssetsByUser(string identifier)
        {
            string query = @"SELECT Id, Fund_Cluster,CollCode, Name, Desc1, Provider_Name,
                            DATE_FORMAT(AnDate, '%Y-%m-%d') AS AnDate, 
                            PN, PAR, Qty, UM, UCost, TCost, UserName, Email, CurrentUser, EqStatus, SerialNumber,Location,UserId
                     FROM tbl_assets 
                     WHERE Email = @identifier OR CurrentUser = @identifier";

            DataTable table = new();
            try
            {
                using (var con = GetConnection())
                {
                    using (var cmd = new MySqlCommand(query, con))
                    {
                        cmd.Parameters.AddWithValue("@identifier", identifier);
                        con.Open();
                        using (var reader = cmd.ExecuteReader())
                        {
                            table.Load(reader);
                        }
                    }
                }
                return Ok(table);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal Server Error: {ex.Message}");
            }
        }
    }
}
