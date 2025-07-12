-- MySQL bulk insert statements for table: teams
-- Generated on: 2025-07-12T04:10:40.951Z
-- Total records: 3

CREATE TABLE IF NOT EXISTS `teams` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `team_number` INT,
  `team_name` VARCHAR(255) NULL,
  `created_at` VARCHAR(255),
  `updated_at` DATETIME,
  `deleted_at` VARCHAR(255),
  `is_deleted` INT
);

INSERT INTO `teams` (`id`, `team_number`, `team_name`, `created_at`, `updated_at`, `deleted_at`, `is_deleted`) VALUES
(7695873196687360, 7565131170971648, NULL, '2025-07-11 05:15:51', '2025-07-11 06:12:25', '2025-07-12 02:55:25', 0),
(6139230145216512, 5219416889360384, NULL, '2025-07-11 18:21:20', '2025-07-11 16:38:45', '2025-07-11 22:50:48', 0),
(195537064165376, 7523713624834048, NULL, '2025-07-11 19:12:39', '2025-07-11 09:32:10', '2025-07-11 18:14:22', 0)
;