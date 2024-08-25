const { SlashCommandBuilder, EmbedBuilder, WebhookClient, Client, CommandInteraction, CommandInteractionOptionResolver } = require("discord.js");
const roblox = require("noblox.js");
const config = require("../../config.json");
const { requiredRoles } = require('../../config.json').discord;
const { interactionEmbed } = require('../../functions');

module.exports = {
    name: "pend_request",
    data: new SlashCommandBuilder()
        .setName("pend_request")
        .setDescription("Request to be accepted into a Roblox group.")
        .addStringOption(option =>
            option.setName("user")
                .setDescription("Roblox username")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("group")
                .setDescription("Select the group you want to check and accept.")
                .setRequired(true)
                .addChoices(
                    { name: "DS Group", value: "ds" },
                    { name: "OA Group", value: "oa" }
                )
        ),
    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {CommandInteractionOptionResolver} options
     */
    async run(client, interaction, options) {

        const hasRole = requiredRoles.some(roleId => interaction.member.roles.cache.has(roleId));
        if (!hasRole) {
        return interactionEmbed(3, "[ERR-UPRM]",'', interaction, client, [true, 30]);
        }

        if (interaction.channel.id !== "847626445848838154") {
            return await interaction.reply({ content: "This command can only be used in <#847626445848838154>", ephemeral: true });
        }
        await interaction.deferReply();

        const robloxname = options.getString("user");
        const selectedGroup = options.getString("group");
        let robloxid;

        const dsGroupId = 10421203;
        const oaGroupId = 10436572;
        const selectedGroupId = selectedGroup === "ds" ? dsGroupId : oaGroupId;

        // Fetch Roblox ID using the noblox library
        try {
            if (robloxname) {
                // If the Roblox username is provided
                robloxid = await roblox.getIdFromUsername(robloxname);
            } else {
                return interaction.editReply("Please provide a valid Roblox username.");
            }
        } catch (error) {
            console.log(error);
            return interaction.editReply("There was an error handling that join request. The Roblox username does not exist.");
        }

        if (!robloxid) {
            return interaction.editReply("There was an error handling that join request. The Roblox username does not exist.");
        }

        // Check if the user is already in the selected group
        const isMemberOfSelectedGroup = await roblox.getRankInGroup(selectedGroupId, robloxid) > 0;

        if (!isMemberOfSelectedGroup) {
            // Handle join request for the selected group
            await roblox.handleJoinRequest(selectedGroupId, robloxid, true).then(async () => {
                interaction.editReply("Successfully accepted user into the group. Run update to get your roles in <#912968020824051743>");
                const embed = new EmbedBuilder()
                    .setAuthor({ name: interaction.guild.members.me.user.tag, iconURL: interaction.guild.members.me.user.displayAvatarURL() })
                    .setDescription(`**Moderator:** ${interaction.guild.members.me} (\`${interaction.guild.members.me.user.id}\`)\n**Action:** Automated Accept Join Request\n**User:** ${robloxname} (\`${robloxid}\`)\n**Reason:** Automated pend request invoked.`)
                    .setTimestamp()
                    .setColor("#043b64");
                const webhookClient = new WebhookClient({ id: config.discord.webhookId, token: config.discord.webhookToken });
                webhookClient.send({
                    content: "- Group Acceptance Logs",
                    username: "Group | Acceptance Logs",
                    embeds: [embed],
                });
            }).catch((err) => {
                console.log(err);
                return interaction.editReply("There was an error handling that join request.");
            });
        } else {
            return interaction.editReply("There was an error handling that join request. The user is not in the selected group.");
        }
    }
};
