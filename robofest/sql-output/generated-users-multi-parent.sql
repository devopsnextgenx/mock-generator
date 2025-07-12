-- MySQL bulk insert statements for table: users
-- Generated on: 2025-07-12T04:10:40.950Z
-- Total records: 10

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `password` VARCHAR(255) NOT NULL,
  `first_name` VARCHAR(100),
  `last_name` VARCHAR(100),
  `birth_date` DATETIME,
  `registration_date` DATETIME,
  `active` INT,
  `created_at` VARCHAR(255),
  `updated_at` DATETIME,
  `deleted_at` VARCHAR(255),
  `is_deleted` INT,
  `user_name` VARCHAR(100)
);

INSERT INTO `users` (`id`, `password`, `first_name`, `last_name`, `birth_date`, `registration_date`, `active`, `created_at`, `updated_at`, `deleted_at`, `is_deleted`, `user_name`) VALUES
(1000, 'yu24oVSYL_xhD_h', 'Simone', 'Balistreri-Adams', '1963-01-28 04:43:48', '2025-07-12 01:37:23', 1, '2025-07-11 21:00:32', '2025-07-11 08:48:11', '2025-07-11 12:25:26', 0, 'simone.balistreri-adams'),
(1001, 'mwsUpemeyMCbJfp', 'Zander', 'Pagac', '1990-09-14 17:36:16', '2025-07-11 09:11:53', 1, '2025-07-12 00:04:33', '2025-07-11 19:26:56', '2025-07-12 03:32:00', 0, 'zander.pagac'),
(1002, 'mcvovOpRwY_vnfn', 'Dave', 'Hoeger', '1995-03-25 07:24:20', '2025-07-11 11:23:46', 1, '2025-07-11 16:32:21', '2025-07-11 22:55:22', '2025-07-11 18:12:45', 0, 'dave.hoeger'),
(1003, 'MiLUdb1wS0pjEyZ', 'Ada', 'Kertzmann', '1975-05-11 03:03:58', '2025-07-11 10:28:02', 1, '2025-07-11 19:09:34', '2025-07-11 07:48:41', '2025-07-11 16:20:23', 1, 'ada.kertzmann'),
(1004, 'E8AVl2zbflWdyuG', 'Jerome', 'Herman', '1992-09-06 03:38:28', '2025-07-11 11:02:11', 1, '2025-07-11 16:05:00', '2025-07-12 02:11:35', '2025-07-11 22:45:45', 0, 'jerome.herman'),
(1005, '8klePKwhz_SC8De', 'Mabel', 'Bednar', '1975-12-01 09:33:13', '2025-07-12 02:17:58', 1, '2025-07-12 01:58:19', '2025-07-11 19:41:32', '2025-07-11 08:51:19', 0, 'mabel.bednar'),
(1006, '6jkaq9JwoBvi3yI', 'Asa', 'Conroy', '1993-11-10 09:09:14', '2025-07-11 15:47:53', 1, '2025-07-11 11:38:01', '2025-07-12 02:10:48', '2025-07-11 07:37:08', 0, 'asa.conroy'),
(1007, 'X3dp8vUKWLAQuaI', 'Jenifer', 'Walter-Schmidt', '1976-12-25 13:11:43', '2025-07-11 05:34:43', 1, '2025-07-11 19:04:13', '2025-07-11 14:33:27', '2025-07-11 18:26:51', 0, 'jenifer.walter-schmidt'),
(1008, 'zKHiXDOMgwbSeRf', 'Barton', 'Cartwright', '1945-12-09 20:49:50', '2025-07-11 12:43:45', 0, '2025-07-11 17:28:29', '2025-07-11 09:13:58', '2025-07-12 02:20:45', 0, 'barton.cartwright'),
(1009, 'tC0x1smX8LiHctu', 'Matilda', 'Goyette', '1958-12-21 11:35:45', '2025-07-12 02:37:52', 1, '2025-07-11 23:24:39', '2025-07-12 00:11:49', '2025-07-11 05:49:03', 0, 'matilda.goyette')
;