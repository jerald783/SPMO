namespace BACKEND.Models
{
    public class AssetModel
    {
        public int Id { get; set; }
        public string? PPE { get; set; }
        public string? Fund_Cluster { get; set; }
        public string? CollCode { get; set; }
        public string? Name { get; set; }
        public string? Desc1 { get; set; }
        public string? Provider_Name { get; set; }
        public DateTime AnDate { get; set; }
        public string? PN { get; set; }
        public string? PAR { get; set; }
        public int Qty { get; set; }
        public string? UM { get; set; }
        public decimal UCost { get; set; }
        public decimal TCost { get; set; }
        public string? UserName { get; set; }
        public string? Email { get; set; }
        public string? CurrentUser { get; set; }
        public string? EqStatus { get; set; }
        public string? SerialNumber { get; set; }
        public string? Location { get; set; }
        public int UserId { get; set; }
    }

    public class BulkTransferRequest
    {
        public List<int>? Ids { get; set; }
        public string? NewEmail { get; set; }
    }

}
