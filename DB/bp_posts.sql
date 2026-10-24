-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: bp
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `posts` (
  `post_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `concept` varchar(1025) DEFAULT NULL,
  `result` varchar(1025) DEFAULT NULL,
  `visibility` enum('public','private') DEFAULT 'public',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `project_id` int DEFAULT NULL,
  PRIMARY KEY (`post_id`),
  KEY `user_id` (`user_id`),
  KEY `fk_post_project` (`project_id`),
  CONSTRAINT `fk_post_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`project_id`) ON DELETE SET NULL,
  CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `posts`
--

LOCK TABLES `posts` WRITE;
/*!40000 ALTER TABLE `posts` DISABLE KEYS */;
INSERT INTO `posts` VALUES (1,1,'Loading Cat Animation','A short animated loop featuring a stylized cat loader animation designed for use in applications, websites, or digital interfaces. The animation focuses on smooth motion, playful visual design, and user-friendly feedback during loading or waiting states.','The project was created to transform a standard loading screen into a more engaging and visually appealing experience. Instead of using a traditional spinner or progress bar, the animation uses a cat character to create a friendlier interaction and improve the overall atmosphere of the interface. The design emphasizes simplicity, smooth looping animation, and modern aesthetic suitable for creative or entertainment-focused platforms.','The final result is a lightweight looping animation that can be integrated into user interfaces as a loading indicator. The animation provides visual feedback while maintaining an entertaining and polished appearance, improving user experience during waiting periods or content loading.','public','2026-05-10 15:28:08','2026-05-10 15:56:09',NULL),(2,2,'Focusly Eye Icon Design','A minimalist eye-shaped icon created as part of the visual identity for the Focusly productivity app. The design uses simple shapes, soft curves, and a clean color palette to create a modern symbol representing focus, attention, and awareness.','The icon was designed to visually represent concentration and deep focus through a simplified eye symbol. The goal was to create a recognizable and lightweight design that could work across different platforms, including application icons, branding materials, loading animations, and website interfaces. The soft purple accent adds personality while maintaining a calm and minimal aesthetic.','The final result is a clean and versatile icon suitable for modern digital products. The design successfully communicates the core idea of focus and visual clarity while remaining simple enough for scalable use in UI elements, branding, and marketing materials.','public','2026-05-10 16:50:19','2026-05-10 16:50:19',1),(3,2,'Focusly Eye Logo Exploration','An early logo exploration created during the branding process for the Focusly productivity application. The design experiments with a minimalist eye symbol using monochromatic tones and soft accent colors to establish the visual direction of the brand.','The concept focuses on representing concentration, awareness, and mental clarity through a simplified eye illustration. This version was created to test shape balance, proportions, and readability before integrating the symbol into the final branding system. The minimalist style was chosen to match the calm and distraction-free philosophy of the application.','The result is a clean prototype logo that helped define the visual identity of the project. The exploration provided the foundation for later refinements and demonstrated how the icon could function across interfaces, landing pages, and branding materials.','public','2026-05-10 16:52:45','2026-05-10 16:53:07',1),(4,1,'Focusly – Dark Mode Landing Page Design','A modern dark-themed landing page concept created for the Focusly productivity application. The design combines calming nighttime visuals, minimalist interface elements, and soft purple accents to create a focused and immersive user experience.','The concept explores how visual atmosphere can influence productivity and concentration. The dark mode aesthetic was designed to reduce visual noise while maintaining strong readability and a relaxing mood. Inspired by late evening environments and deep focus sessions, the interface uses minimal layouts, soft contrast, and clean typography to create a calm digital space.  The eye symbol remains the central branding element, representing awareness, focus, and mental clarity throughout the interface.','The final result is a polished landing page concept with a cohesive visual identity and modern user interface design. The project successfully combines branding, typography, color theory, and layout design into a clean and visually engaging presentation suitable for a productivity-focused application.','public','2026-05-10 17:00:16','2026-05-10 17:00:16',1),(5,1,'PUPPr – Productivity App Logo Design','A playful and recognizable logo created for PUPPr, an offline-first productivity application focused on task management and organization. The logo combines a stylized dog character with task-related visual elements to create a friendly and approachable identity for the application.','The concept behind the logo was to make productivity feel less stressful and more motivating through a mascot-based design. The dog character symbolizes loyalty, consistency, and daily routine, while the checklist element represents task management and productivity features inside the app.  The visual identity was designed to feel lightweight, memorable, and welcoming compared to traditional corporate productivity tools. Soft colors and simplified shapes help create a friendly atmosphere while still keeping the branding clear and recognizable.','The final result is a unique mascot-style logo that gives the application personality and stronger emotional connection with users. The design successfully communicates the app’s focus on productivity while maintaining a playful and modern appearance suitable for desktop applications, websites, and branding materials.','public','2026-05-10 19:18:26','2026-05-10 19:18:26',NULL),(6,2,'Nora – Candle Brand Logo Design','A minimalist logo and branding concept created for Nora, a candle and home atmosphere brand focused on warmth, comfort, and elegant simplicity. The design combines symbolic shapes and soft color tones to create a calm and recognizable visual identity.','The logo merges the silhouette of a house with a candle-inspired letter “N” to visually represent home, warmth, and light. The candle flame element symbolizes comfort, relaxation, and peaceful atmosphere, while the overall composition was designed to feel modern, soft, and welcoming.  The muted color palette reinforces the cozy aesthetic and helps the branding feel premium yet approachable. The slogan “Light up your world” supports the emotional direction of the brand and strengthens the connection between the product and the atmosphere it creates.','The final result is a clean and memorable logo suitable for candle packaging, websites, social media branding, and promotional materials. The design successfully communicates a cozy and elegant brand identity while maintaining simplicity and strong visual recognition.','public','2026-05-10 19:20:06','2026-05-10 19:20:06',2),(7,2,'Wanderly – Travel Brand Logo Design','A creative logo concept designed for Wanderly, a travel-focused brand centered around exploration, adventure, and discovery. The logo uses a playful path-inspired typography style to visually represent movement, journeys, and travel experiences.','The design transforms the first letter into a winding travel path with directional arrows, symbolizing adventure, navigation, and continuous exploration. The dotted route aesthetic was inspired by travel maps and hiking trails, helping the branding instantly communicate themes of movement and discovery.  The earthy green color palette was chosen to reflect nature, outdoor experiences, and eco-friendly travel aesthetics while maintaining a modern and approachable visual identity.','The final result is a memorable and visually distinctive logo that captures the spirit of travel and adventure. The branding works effectively across digital platforms, travel applications, websites, merchandise, and social media while maintaining a playful and recognizable appearance.','private','2026-05-10 19:21:53','2026-05-10 19:21:53',NULL),(8,1,'Little Fox – 3D Character Model','A stylized 3D fox character created as a digital modeling project focused on cute aesthetics, simplified forms, and expressive design. The model was designed to have a friendly and playful appearance suitable for games, animations, interactive applications, or creative digital scenes.','The concept behind the project was to create a charming low-poly style animal character with a soft and approachable personality. The fox was chosen because of its recognizable silhouette and ability to balance playful and elegant visual traits. The design emphasizes clean geometry, smooth proportions, and readability while maintaining a lightweight structure suitable for real-time rendering.','The final result is a stylized 3D fox model optimized for use in digital environments such as games, animations, or interactive web experiences. The project successfully combines character design principles with simple and efficient 3D modeling techniques to create a visually appealing asset.','public','2026-05-10 19:23:08','2026-05-10 19:23:08',NULL);
/*!40000 ALTER TABLE `posts` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-10 21:58:19
